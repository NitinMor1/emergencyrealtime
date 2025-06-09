import { Response, Request, NextFunction } from "express";
import { EUploadFileFormat, EUploadFileType, EUploadTags, EUploadUser, IUpload } from "./uploadModel";
import { getCollection } from "../../db/db";
import { CloudinaryExtendedRequest } from "../../utils/cloudinary/cloudinary.controllers";
import { IHospital } from "../auth/HospitalModel";

export const validateHospitalImageReq = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const file = req.file;

        if (!file) {
            return res.status(400).json(
                {
                    success: false,
                    message: "file not found"
                }
            )
        }

        const { hospitalId, id } = req.query;

        if (!hospitalId || !id) {
            return res.status(400).json(
                {
                    success: false,
                    message: "hospitalId is required"
                }
            )
        }

        const hospitalColl = await getCollection<IHospital>("Hospitals", null);
        const hospital = await hospitalColl.findOne({ hospitalId: hospitalId as string })

        if (!hospital) {
            return res.status(404).json(
                {
                    success: false,
                    message: "hospital not found"
                }
            )
        }

        (req as any).hospitalColl = hospitalColl;
        next()

    } catch (error: any) {
        console.log("error in uploading footer "+ error.message);
        return res.status(500).json(
            {
                success: false,
                message: "Internal Server Error"
            }
        )
    }
}

export const uploadFooterOrHeader = async (req: CloudinaryExtendedRequest, res: Response) => {
    try {
        const file: any = req.file;
        const { hospitalId, id, isFooter }: any = req.query;
    
        // Convert string to boolean properly
        const isFooterBool = isFooter === 'true';
        console.log("isFooter", isFooter, "isFooterBool", isFooterBool);

        const upload: IUpload = {
            hospitalId: hospitalId?.toString(),
            uploadedBy: {
                user: EUploadUser.EMPLOYEE,
                userId: id.toString()
            },
            fileName: file.originalname,
            fileType: EUploadFileType.IMG,
            format: EUploadFileFormat.PNG,
            tags: [isFooterBool ? EUploadTags.FOOTER : EUploadTags.HEADER],
            cloudinary: {
                url: file.path,
                publicId: req.public_id?.toString() ?? ""
            },
            uploadedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        const uploadColl = await getCollection<IUpload>("Uploads", hospitalId.toString());
        const result = await uploadColl.insertOne(upload);
        const uploadData = { ...upload, _id: result.insertedId };

        const hospitalColl = (req as any).hospitalColl;

        const updateField = isFooterBool ? "Images.footerImage" : "Images.headerImage";
        await hospitalColl.findOneAndUpdate(
            { hospitalId: hospitalId.toString() },
            { $set: { [updateField]: uploadData.cloudinary.url } }
        );

        return res.status(201).json({
            success: true,
            message: `${isFooterBool ? EUploadTags.FOOTER : EUploadTags.HEADER} uploaded successfully`,
            data: uploadData
        })
    } catch (error:any) {
        console.log("error in uploading footer or header "+ error.message);
        return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            }
        )
    }
}

export const uploadLogo = async (req: CloudinaryExtendedRequest, res: Response) => {
    try {
        const file: any = req.file;
        const { hospitalId, id }: any = req.query;

        const upload: IUpload = {
            hospitalId: hospitalId?.toString(),
            uploadedBy: {
                user: EUploadUser.EMPLOYEE,
                userId: id.toString()
            },
            fileName: file.originalname,
            fileType: EUploadFileType.IMG,
            format: EUploadFileFormat.PNG,
            tags: [EUploadTags.LOGO],
            cloudinary: {
                url: file.path,
                publicId: req.public_id?.toString() || ""
            },
            uploadedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        const uploadColl = await getCollection<IUpload>("Uploads", hospitalId.toString());
        const result = await uploadColl.insertOne(upload);
        const uploadData = { ...upload, _id: result.insertedId };

        const hospitalColl = (req as any).hospitalColl;

        await hospitalColl.findOneAndUpdate(
            { hospitalId: hospitalId.toString() },
            { $set: { "Images.hospitalLogo": uploadData.cloudinary.url } }
        );

        return res.status(201).json({
            success: true,
            message: `hospital logo uploaded successfully`,
            data: uploadData
        })
    } catch (error:any) {
        console.log("error in uploading logo "+ error.message);
        return res.status(500).json(
            {
                success: false,
                message: "Internal Server Error"
            }
        )
    }
}
