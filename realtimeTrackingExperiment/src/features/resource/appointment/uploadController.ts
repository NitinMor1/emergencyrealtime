import { NextFunction, Request, Response } from "express";
import { MongoClient, GridFSBucket, ObjectId, Db } from "mongodb";
import { getDbName, MONGODB_URI } from "../../../db/db";

const connectMongoDB = async (): Promise<Db> => {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    return client.db();
};
import { Readable } from 'stream';
import { CloudinaryExtendedRequest, getFilesByHospital, handleDelete, handleFileDownload } from "../../../utils/cloudinary/cloudinary.controllers";
export const uploadPdf = async (req: Request, res: Response) => {
    try {
        // Check for both file and hospitalId in one go
        if (!req.file || !req.body.hospitalId) {
            return res.status(400).json({
                success: false,
                message: !req.file ? "No file uploaded" : "Hospital ID is required",
            });
        }

        const { hospitalId, title } = req.body

        if (!hospitalId || !title) {
            return res.status(400).json(
                {
                    success: false,
                    message: "hospitalId and title are required fields!"
                }
            )
        }

        const db: Db = await connectMongoDB();

        const bucket = new GridFSBucket(db, {
            bucketName: hospitalId,
        });

        const readableStream = new Readable();
        readableStream.push(req.file.buffer);
        readableStream.push(null);

        const uploadStream = bucket.openUploadStream(req.file.originalname, {
            metadata: {
                hospitalId: hospitalId,
                title: title,
            }
        });

        // Pipe and handle response directly in the stream events
        readableStream.pipe(uploadStream)
            .on('finish', () => {
                return res.status(200).json({
                    success: true,
                    message: "PDF uploaded successfully",
                    fileId: uploadStream.id,
                    filePath: uploadStream.id.toHexString(),
                    filename: req.file ? req.file.originalname : '',
                    hospitalId: hospitalId,
                });
            })
            .on('error', (error) => {
                console.error("Error in upload:", error);
                return res.status(500).json({
                    success: false,
                    message: "Error in upload",
                    error: error.message,
                });
            });

    } catch (error: any) {
        console.error("Error in upload:", error);
        return res.status(500).json({
            success: false,
            message: "Error in upload",
            error: error.message,
        });
    }
};

export const getPdf = async (req: Request, res: Response) => {
    try {
        const fileId = req.params.id;
        const hospitalId = req.params.hospitalId;

        if (!fileId || !hospitalId) {
            return res.status(400).json({
                success: false,
                message: "File ID and Hospital ID are required",
            });
        }

        const db = await connectMongoDB();
        const bucket = new GridFSBucket(db, {
            bucketName: hospitalId
        });

        const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

        downloadStream.on('file', (file) => {
            res.set('Content-Type', file.contentType);
            res.set('Content-Disposition', `attachment; filename="${file.filename}"`);
        });

        downloadStream.on('error', (error) => {
            console.error("Error in download stream:", error);
            res.status(404).json({
                success: false,
                message: "File not found",
                error: error.message,
            });
        });

        downloadStream.pipe(res);

    } catch (error: any) {
        console.error("Error in download:", error);
        res.status(500).json({
            success: false,
            message: "Error in download",
            error: error.message,
        });
    }
};


export const getPdfsList = async (req: Request, res: Response) => {
    try {
        const hospitalId = req.query.hospitalId as string;

        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "Hospital ID is required",
            });
        }

        const db = await connectMongoDB();
        const bucket = new GridFSBucket(db, {
            bucketName: hospitalId
        });

        const pdfs = await db.collection(`${hospitalId}.files`).find().toArray();

        const pdfList = pdfs.map(pdf => ({
            id: pdf._id,
            filename: pdf.filename,
            uploadDate: pdf.uploadDate,
            size: pdf.length,
            metadata: pdf.metadata
        }));

        return res.status(200).json({
            success: true,
            message: "List of PDFs retrieved successfully",
            data: pdfList,
        });

    } catch (error: any) {
        console.error("Error in getting list of PDFs:", error);
        res.status(500).json({
            success: false,
            message: "Error in getting list of PDFs",
            error: error.message,
        });
    }
};

export const deletePdf = async (req: Request, res: Response) => {
    try {
        const fileId = req.params.id;
        const hospitalId = req.params.hospitalId;

        if (!fileId || !hospitalId) {
            return res.status(400).json({
                success: false,
                message: "File ID and Hospital ID are required",
            });
        }

        const db = await connectMongoDB();
        const bucket = new GridFSBucket(db, {
            bucketName: hospitalId
        });

        await bucket.delete(new ObjectId(fileId));
        if (!bucket) {
            return res.status(404).json({
                success: false,
                message: "PDF not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "PDF deleted successfully",
        });
    } catch (error: any) {
        console.error("Error in deleting PDF:", error);
        res.status(500).json({
            success: false,
            message: "Error in deleting PDF",
            error: error.message,
        });
    }
}

export const updatePdf = async (req: Request, res: Response) => {
    try {
        const fileId = req.params.id;
        const hospitalId = req.params.hospitalId;
        const title = req.body.title;
        const file = req.file

        if (!file) {
            return res.status(400).json(
                {
                    success: false,
                    message: "file not uploaded"
                }
            )
        }


        if (!fileId || !hospitalId || !title) {
            return res.status(400).json({
                success: false,
                message: "File ID, Hospital ID and Title are required",
            });
        }

        const db = await connectMongoDB();

        const pdf = await db.collection(`${hospitalId}.files`).findOne({ _id: new ObjectId(fileId) });

        if (!pdf) {
            return res.status(404).json({
                success: false,
                message: "PDF not found",
            });
        }
        const bucket = new GridFSBucket(db, {
            bucketName: hospitalId
        });

        // Delete the old PDF file from GridFS 
        await bucket.delete(new ObjectId(fileId));

        // Upload the new PDF file to GridFS
        const uploadStream = bucket.openUploadStream(file.originalname, {
            metadata: {
                hospitalId,
                title,
            }
        });

        const readableStream = Readable.from(file.buffer);
        readableStream.pipe(uploadStream)
            .on('finish', async () => {
                return res.status(200).json({
                    success: true,
                    message: "PDF updated successfully",
                    fileId: uploadStream.id,
                    filePath: uploadStream.id.toHexString(),
                    filename: req.file ? req.file.originalname : '',
                    hospitalId: hospitalId,
                });
            })
            .on('error', (error) => {
                console.error("Error in uploading PDF:", error);
                return res.status(500).json({
                    success: false,
                    message: "Error in uploading new PDF",
                    error: error.message,
                });
            });
    } catch (error: any) {
        console.error("Error in updating PDF:", error);
        res.status(500).json({
            success: false,
            message: "Error in updating PDF",
            error: error.message,
        });
    }
}

export const uploadOnCloudinary = async (req: CloudinaryExtendedRequest, res: Response) => {

    const file = req.file;

    if (!file) {
        return res.status(400).json(
            {
                success: false,
                message: "file not found"
            }
        )
    }
    res.status(200).json({
        success: true,
        message: "PDF uploaded successfully",
        public_id: req.public_id,
        filePath: file.path,
        filename: file.originalname,
        ...(req.query.hospitalId && { hospitalId: req.query.hospitalId }),
    });
}

export const getPDFsListFromCloudinary = async (req: Request, res: Response) => {
    try {
        const { hospitalId } = req.query;

        if (!hospitalId) {
            return res.status(400).json(
                {
                    success: true,
                    message: "hospital id is required"
                }
            )
        }

        const files = await getFilesByHospital(hospitalId?.toString(), "raw");

        return res.status(200).json({
            success: true,
            count: files.length,
            files
        });
    } catch (error) {
        console.error('Error listing files:', error);
        return res.status(500).json({
            message: 'Error retrieving files',
            error: (error as Error).message
        });
    }
}

export const downloadPdfFromCloudinary = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.query; // public id 
        if (!id) {
            return res.status(400).json({ success: false, message: "id is required!!" })
        }
        req.body.resource_type = "raw";
        req.body.public_id = id.toString();
        next();
    } catch (error:any) {
        console.error("error in downloading file: ", error.message)
        return res.status(500).json(
            {
                success: true,
                message: "Internal Server Error"
            }
        )
    }
}

export const deletePdfFromCloudinary = async (req: Request, res: Response) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ success: false, message: "public_id is required!!" })
        }
        await handleDelete(id.toString(), "raw");

        return res.status(200).json({
            success: true,
            message: "file deleted successfully"
        })

    } catch (error) {
        console.error("error in deleting file: ", error)
        return res.status(500).json(
            {
                success: true,
                message: "Internal Server Error"
            }
        )
    }

}