// filepath: d:\Medoc HP+\HP-Backend\HPlus-Backend\src\features\LabsScansTest\radiology\radiologyController.ts
import { Request, Response, NextFunction } from 'express';
import cloudinary from '../../../utils/cloudinary/cloudinary.config';
import { getDbName } from '../../../db/db';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Constants for DICOM upload limits
const DICOM_MAX_FILE_SIZE = Number(process.env.DICOM_MAX_FILE_SIZE) || 1024 * 1024 * 1024; // 1GB
const DICOM_ALLOWED_MIME_TYPES = ['application/dicom', 'application/octet-stream'];
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks for streaming

// Custom error class for DICOM uploads
class DicomUploadError extends Error {
statusCode: number;

constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'DicomUploadError';
    this.statusCode = statusCode;
}
}

// File metadata interface
interface DicomFileMetadata {
public_id: string;
filename: string;
uploadDate: string;
hospitalId: string;
patientId: string;
studyInstanceUID?: string;
seriesInstanceUID?: string;
modality?: string;
fileSize: number;
}

// Initialize local storage for chunked uploads
const tempUploadsDir = path.join(__dirname, '../../../../temp/dicom_uploads');

// Ensure temp directory exists
if (!fs.existsSync(tempUploadsDir)) {
fs.mkdirSync(tempUploadsDir, { recursive: true });
}

// Unique identifier for DICOM files
const getUniqueDicomFilename = (filename: string) => {
const timestamp = Date.now();
const uniqueId = uuidv4().replace(/-/g, '_').substring(0, 8);
const sanitizedFilename = filename
    .split('.')[0]
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .substring(0, 20);

return `${sanitizedFilename}_${timestamp}_${uniqueId}`;
};

// Disk storage for temporary chunked file uploads
const diskStorage = multer.diskStorage({
destination: (_req, _file, cb) => {
    cb(null, tempUploadsDir);
},
filename: (_req, file, cb) => {
    const uniqueFilename = getUniqueDicomFilename(file.originalname);
    cb(null, `${uniqueFilename}.dcm`);
},
});

// Filter for DICOM files
const dicomFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
if (DICOM_ALLOWED_MIME_TYPES.includes(file.mimetype) ||
    file.originalname.toLowerCase().endsWith('.dcm')) {
    cb(null, true);
} else {
    cb(new DicomUploadError('Only DICOM files are allowed'));
}
};

// Multer configuration for large file uploads
const dicomUpload = multer({
storage: diskStorage,
fileFilter: dicomFileFilter,
limits: { fileSize: DICOM_MAX_FILE_SIZE },
});

/**
 * Uploads a DICOM file to Cloudinary
 * This handles large files by first saving to disk, then streaming to Cloudinary
 */
export const handleDicomUpload = (field: string) => {
return (req: Request, res: Response, next: NextFunction) => {
    const upload = dicomUpload.single(field);

    upload(req, res, async (err) => {
    if (err) {
        console.error('DICOM upload error', { error: err });

        if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
            message: `File too large. Maximum size is ${DICOM_MAX_FILE_SIZE / (1024 * 1024)}MB`
            });
        }
        }

        const statusCode = err instanceof DicomUploadError ? err.statusCode : 400;
        return res.status(statusCode).json({ message: err.message });
    }

    try {
        if (!req.file) {
        return res.status(400).json({ message: 'No DICOM file uploaded' });
        }

        // Store file path for the next middleware
        req.body.tempFilePath = req.file.path;
        req.body.originalFilename = req.file.originalname;
        req.body.mimeType = req.file.mimetype;
        req.body.fileSize = req.file.size;

        next();
    } catch (error: any) {
        console.error('DICOM upload handling error:', { error });
        // Clean up temporary file if it exists
        if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({ message: 'Error handling DICOM upload' });
    }
    });
};
};

/**
 * Middleware to upload the temporary file to Cloudinary using streaming
 */
export const streamToCloudinary = async (req: Request, res: Response, next: NextFunction) => {
const { tempFilePath, originalFilename, fileSize } = req.body;
const { hospitalId, patientId } = req.query;

if (!tempFilePath || !fs.existsSync(tempFilePath)) {
    return res.status(400).json({ message: 'No temporary file found' });
}

try {
    const rootFolder = getDbName(hospitalId?.toString());
    if (!rootFolder) {
    throw new DicomUploadError('Could not determine storage folder');
    }

    const folder = `${rootFolder}/dicom`;
    const fileName = path.basename(tempFilePath);
    const publicId = `${folder}/${fileName}`;

    // Create a read stream from the temporary file
    const readStream = fs.createReadStream(tempFilePath);

    // Upload using Cloudinary's upload_stream
    const uploadPromise = new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
        {
        resource_type: 'raw',
        public_id: publicId,
        folder: folder,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        context: {
            filename: originalFilename,
            uploadDate: new Date().toISOString(),
            hospitalId: hospitalId?.toString() || "",
            patientId: patientId?.toString() || "",
            fileSize: fileSize.toString()
        }
        },
        (error, result) => {
        if (error) {
            console.error('Cloudinary upload error', { error });
            reject(error);
        } else {
            resolve(result);
        }
        }
    );

    readStream.pipe(uploadStream);
    });

    const result = await uploadPromise;

    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);

    // Add the upload result to the request for subsequent middleware
    req.body.cloudinaryResult = result;
    next();

} catch (error: any) {
    console.error('Cloudinary streaming error:', { error });
    
    // Clean up temporary file
    if (fs.existsSync(tempFilePath)) {
    fs.unlinkSync(tempFilePath);
    }
    
    return res.status(500).json({ 
    message: 'Error uploading to Cloudinary',
    error: error.message
    });
}
};

/**
 * Handle chunk upload for large DICOM files
 */
export const handleChunkedUpload = () => {
return async (req: Request, res: Response) => {
    const chunkNumber = parseInt(req.headers['x-chunk-number'] as string) || 0;
    const totalChunks = parseInt(req.headers['x-total-chunks'] as string) || 1;
    const fileIdentifier = req.headers['x-file-identifier'] as string;
    const { hospitalId } = req.query;
    
    if (!fileIdentifier) {
    return res.status(400).json({ message: 'File identifier missing' });
    }

    try {
    const tempDir = path.join(tempUploadsDir, fileIdentifier);
    
    // Create directory for this file's chunks if it doesn't exist
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const chunkPath = path.join(tempDir, `chunk-${chunkNumber}`);
    
    // Create write stream for this chunk
    const writeStream = fs.createWriteStream(chunkPath);
    
    // Pipe the request to the write stream
    req.pipe(writeStream);
    
    writeStream.on('finish', async () => {
        // Check if this was the last chunk
        if (chunkNumber === totalChunks - 1) {
        try {
            // Combine all chunks
            const finalFilePath = path.join(tempUploadsDir, `${fileIdentifier}.dcm`);
            const writeStream = fs.createWriteStream(finalFilePath);
            
            for (let i = 0; i < totalChunks; i++) {
            const chunkPath = path.join(tempDir, `chunk-${i}`);
            const chunkStream = fs.createReadStream(chunkPath);
            
            // Wait for each chunk to be written
            await new Promise<void>((resolve, reject) => {
                chunkStream.pipe(writeStream, { end: false });
                chunkStream.on('end', resolve);
                chunkStream.on('error', reject);
            });
            
            // Remove chunk after it's processed
            fs.unlinkSync(chunkPath);
            }
            
            // Close the final file stream
            writeStream.end();
            
            // Remove the chunks directory
            fs.rmdirSync(tempDir);
            
            // Now upload the complete file to Cloudinary
            const rootFolder = getDbName(hospitalId?.toString());
            if (!rootFolder) {
            throw new Error('Could not determine storage folder');
            }

            const folder = `${rootFolder}/dicom`;
            const fileName = fileIdentifier;
            const publicId = `${folder}/${fileName}`;
            
            // Upload the complete file to Cloudinary
            const uploadResult = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                resource_type: 'auto',
                public_id: publicId,
                folder: folder,
                use_filename: true,
                unique_filename: true,
                overwrite: false,
                context: {
                    filename: fileIdentifier,
                    uploadDate: new Date().toISOString(),
                    hospitalId: hospitalId?.toString() || "",
                }
                },
                (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error', { error });
                    reject(error);
                } else {
                    resolve(result);
                }
                }
            );

            fs.createReadStream(finalFilePath).pipe(uploadStream);
            });
            
            // Clean up the final file
            fs.unlinkSync(finalFilePath);
            
            return res.status(200).json({
            success: true,
            message: 'File uploaded successfully',
            result: uploadResult
            });
        } catch (error: any) {
            console.error('Error processing complete file:', error);
            return res.status(500).json({
            success: false,
            message: 'Error processing complete file',
            error: error.message
            });
        }
        } else {
        // This was not the last chunk, acknowledge receipt
        return res.status(200).json({
            success: true,
            message: `Chunk ${chunkNumber + 1}/${totalChunks} received`,
            chunksReceived: chunkNumber + 1
        });
        }
    });
    
    writeStream.on('error', (error) => {
        console.error('Error writing chunk:', error);
        return res.status(500).json({
        success: false,
        message: 'Error writing chunk',
        error: error.message
        });
    });
    
    } catch (error: any) {
    console.error('Error handling chunked upload:', error);
    return res.status(500).json({
        success: false,
        message: 'Error handling chunked upload',
        error: error.message
    });
    }
};
};

/**
 * Stream a DICOM file from Cloudinary to the client
 */
export const streamDicomDownload = () => {
return async (req: Request, res: Response) => {
    try {
    const { public_id } = req.params;
    
    if (!public_id) {
        return res.status(400).json({ message: 'Public ID is required' });
    }
    
    // Get file details from Cloudinary
    const fileDetails = await cloudinary.api.resource(public_id, {
        resource_type: 'raw',
        type: 'upload'
    });

    if (!fileDetails) {
        return res.status(404).json({ message: 'File not found' });
    }

    // Set appropriate headers for DICOM file
    res.setHeader('Content-Type', 'application/dicom');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(public_id)}"`);
    
    // If file size is available, set Content-Length
    if (fileDetails.bytes) {
        res.setHeader('Content-Length', fileDetails.bytes);
    }

    // Stream the file from Cloudinary to the client
    const fileUrl = fileDetails.secure_url;
    
    // Create a stream from Cloudinary to the client
    const { data: fileStream } = await axios({
        method: 'get',
        url: fileUrl,
        responseType: 'stream'
    });

    // Pipe the file stream to the response
    const streamData = fileStream as NodeJS.ReadableStream;
    streamData.pipe(res);
    
    // Handle errors
    streamData.on('error', (error: any) => {
        console.error('Error streaming file:', error);
        if (!res.headersSent) {
            console.error('Headers already sent, cannot send error response', error.message);
        res.status(500).json({
            success: false,
            message: 'Error streaming file',
        });
        }
    });
    
    } catch (error: any) {
    console.error('Error streaming DICOM download:', error);
    return res.status(500).json({
        success: false,
        message: 'Error streaming DICOM download',
        error: error.message
    });
    }
};
};

/**
 * List all DICOM files for a hospital
 */
export const listDicomFiles = () => {
return async (req: Request, res: Response) => {
    try {
    const { hospitalId, patientId } = req.query;
    
    const hospitalName = getDbName(hospitalId?.toString());
    if (!hospitalName) {
        return res.status(400).json({ message: 'Invalid hospital ID' });
    }
    
    const folderPath = `${hospitalName}/dicom`;
    
    // Build expression based on provided filters
    let expression = `folder:${folderPath}`;
    if (patientId) {
        expression += ` AND context.patientId:${patientId}`;
    }

    // Search for DICOM files in the specified folder
    const result = await cloudinary.search
        .expression(expression)
        .with_field('context')
        .max_results(500)
        .execute();

    // Format the results
    const files = result.resources.map((file: any) => {
        return {
        public_id: file.public_id,
        secure_url: file.secure_url,
        filename: file.context?.filename || path.basename(file.public_id),
        uploadDate: file.context?.uploadDate || file.created_at,
        patientId: file.context?.patientId || '',
        hospitalId: file.context?.hospitalId || '',
        studyInstanceUID: file.context?.studyInstanceUID || '',
        seriesInstanceUID: file.context?.seriesInstanceUID || '',
        modality: file.context?.modality || '',
        size: file.bytes || 0,
        };
    });

    return res.status(200).json({
        success: true,
        count: files.length,
        files
    });
    
    } catch (error: any) {
    console.error('Error listing DICOM files:', error);
    return res.status(500).json({
        success: false,
        message: 'Error listing DICOM files',
        error: error.message
    });
    }
};
};

/**
 * Delete a DICOM file from Cloudinary
 */
export const deleteDicomFile = () => {
return async (req: Request, res: Response) => {
    try {
    const { public_id } = req.params;
    
    if (!public_id) {
        return res.status(400).json({ message: 'Public ID is required' });
    }
    
    // Delete file from Cloudinary
    const result = await cloudinary.uploader.destroy(public_id, {
        resource_type: 'raw',
        invalidate: true
    });
    
    // Check result
    if (result.result === 'ok') {
        return res.status(200).json({
        success: true,
        message: 'File deleted successfully'
        });
    } else {
        return res.status(500).json({
        success: false,
        message: 'File deletion failed',
        result
        });
    }
    
    } catch (error: any) {
    console.error('Error deleting DICOM file:', error);
    return res.status(500).json({
        success: false,
        message: 'Error deleting DICOM file',
        error: error.message
    });
    }
};
};