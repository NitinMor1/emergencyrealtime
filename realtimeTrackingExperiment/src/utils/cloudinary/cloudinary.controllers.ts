import multer, { FileFilterCallback } from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.config';
import { NextFunction, Request, Response } from 'express';
import { getDbName } from '../../db/db';
import { v4 as uuidv4 } from "uuid";

const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/jpg,application/pdf').split(',');

// file meta data
interface FileMetadata {
  public_id: string;
  filename: string;
  uploadDate: String;
  hospitalId: string;
  type: string;
}

// Custom error classes
class FileUploadError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'FileUploadError';
    this.statusCode = statusCode;
  }
}

// Extended request interfaces
export interface CloudinaryExtendedRequest extends Request {
  public_id?: string;
  deleteResult?: any;
}

const getUniqueFilename = (filename: string) => {
  const timestamp = Date.now();
  const uniqueId = uuidv4().replace(/-/g, '_').substring(0, 8);
  const sanitizedFilename = filename
    .split('.')[0]
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .substring(0, 20);

  return `${sanitizedFilename}_${timestamp}_${uniqueId}`
}


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: CloudinaryExtendedRequest, file: Express.Multer.File) => {
    try {
      const { hospitalId } = req.query;
      const root = getDbName(hospitalId?.toString());
      if (!root) {
        throw new FileUploadError('Could not determine storage folder');
      }

      const isPDF = file.mimetype === 'application/pdf';
      const subfolder = isPDF ? "/files" : "/images";
      const folder = root + subfolder


      const fileName = getUniqueFilename(file.originalname);

      const FileMetadata: FileMetadata = {
        public_id: `${folder}/${fileName}${isPDF ? ".pdf" : ""}`,
        filename: fileName,
        uploadDate: new Date().toISOString(),
        hospitalId: hospitalId?.toString() || "",
        type: isPDF ? "raw" : "image"
      }

      req.public_id = FileMetadata.public_id;

      return {
        folder: folder,
        resource_type: isPDF ? 'raw' : 'image',
        format: isPDF ? "pdf" : "png",
        public_id: fileName,
        context: FileMetadata
      };
    } catch (error) {
      console.error('Error configuring storage parameters', { error });
      throw error;
    }
  },
});


const fileFilter = (_: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  try {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new FileUploadError(`Only ${ALLOWED_MIME_TYPES.join(', ')} files are allowed`));
    }

    return cb(null, true);
  } catch (error) {
    return cb(error as Error);
  }
};


const cloudinaryUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
});



export const handleUpload = (field: string) => {
  return (req: Request, res: Response, next: NextFunction) => {

    const upload = cloudinaryUpload.single(field);

    upload(req, res, (err) => {
      if (err) {
        console.error('File upload error', { error: err });

        // Handle specific error types with appropriate responses
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
            });
          }
        }

        // Generic error response
        const statusCode = err instanceof FileUploadError ? err.statusCode : 400;
        return res.status(statusCode).json({ message: err.message });
      }

      try {
        if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
        }
        next();
      } catch (error: any) {
        console.error('Upload handling error:', { error });
        return res.status(500).json({ message: 'Error handling upload' });
      }
    });
  };
};

export const handleDelete = async (public_id: string, resourceType: string = 'image') => {
  try {

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: resourceType,
      invalidate: true
    });

    // Check result
    if (result.result === 'ok') {
      console.info('File deletion successful', { public_id, result });
      return
    } else {
      console.warn('File deletion failed', { public_id, result });
      throw new Error("error in deleting file")
    }
  } catch (error: any) {
    console.error('File deletion error', { error });
    throw new Error("error in deleting file")
  }
};

export const getFilesByHospital = async (hospitalId: string | undefined = undefined, resourceType: 'image' | 'raw' = 'image') => {
  try {
    const folder = getDbName(hospitalId);
    if (!folder) {
      throw new Error('Could not determine storage folder');
    }

    const subfolder = resourceType === 'image' ? '/images' : '/files';
    const folderPath = folder + subfolder;

    // Search for resources in the specified folder with metadata
    const result = await cloudinary.search
      .expression(`folder:${folderPath}`)
      .with_field('context')
      .max_results(500)
      .execute();

    const filterResults = result.resources.map((file: any) => {
      return {
        public_id: file.public_id,
        secure_url: file.secure_url,
        filename: file.context.filename,
        uploadDate: file.context.uploadDate,
        type: file.context.type,
        hospitalId: file.context.hospitalId,
        size: file.bytes,
        format: file.format,
      };
    });

    return filterResults;
  } catch (error) {
    console.error('Error fetching files:', error);
    throw new Error(`Failed to fetch ${resourceType}s: ${(error as Error).message}`);
  }
};

export const getFileBypublic_id = async (public_id: string, resourceType: 'image' | 'raw' = 'image') => {
  try {
    // Get resource details including metadata
    const result = await cloudinary.api.resource(public_id, {
      resource_type: resourceType,
      context: true  // Include metadata
    });

    return result;
  } catch (error) {
    console.error('Error fetching file details:', error);
    throw new Error(`Failed to fetch file details: ${(error as Error).message}`);
  }
};

export const updateFileMetadata = async (
  public_id: string,
  metadata: FileMetadata,
  resourceType: 'image' | 'raw' = 'image'
) => {
  try {
    // Convert metadata object to Cloudinary's expected format (key=value|key2=value2)
    const metadataStr = Object.entries(metadata)
      .map(([key, value]) => `${key}=${value}`)
      .join('|');

    // Update the context (metadata) for the resource
    const result = await cloudinary.uploader.explicit(public_id, {
      resource_type: resourceType,
      type: 'upload',
      context: metadataStr
    });

    return result;
  } catch (error) {
    console.error('Error updating file metadata:', error);
    throw new Error(`Failed to update metadata: ${(error as Error).message}`);
  }
};

export const handleFileListing = () => {
  return async (req: Request, res: Response) => {
    try {
      const { hospitalId, resourceType = 'image' } = req.query;

      if (resourceType !== 'image' && resourceType !== 'raw') {
        return res.status(400).json({ message: 'Resource type must be either "image" or "raw"' });
      }

      const hospitalName = getDbName(hospitalId && hospitalId.toString())

      const files = await getFilesByHospital(hospitalName, resourceType as 'image' | 'raw');

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
  };
};

export const generateDownloadUrl = async (
  public_id: string,
  resourceType: 'image' | 'raw' = 'image',
  expiresIn: number = 3600 // Default 1 hour expiration
): Promise<string> => {
  try {
    // For secure signed URLs with expiration
    const options = {
      resource_type: resourceType,
      type: 'upload',
      attachment: true, // Forces download instead of opening in browser
      expires_at: Math.floor(Date.now() / 1000) + expiresIn // Current time + expiration in seconds
    };

    // Generate signed URL
    const url = cloudinary.url(public_id, options);
    return url;
  } catch (error) {
    console.error('Error generating download URL:', error);
    throw new Error(`Failed to generate download URL: ${(error as Error).message}`);
  }
};

export const handleFileDownload = () => {
  return async (req: Request, res: Response) => {
    try {
      const { public_id } = req.body;
      const { resource_type = 'image' } = req.body;

      if (!public_id) {
        return res.status(400).json({ message: 'Public ID is required' });
      }

      if (resource_type !== 'image' && resource_type !== 'raw') {
        return res.status(400).json({ message: 'Resource type must be either "image" or "raw"' });
      }

      // Get file details to verify it exists and get filename
      const fileDetails = await getFileBypublic_id(public_id.toString(), resource_type as 'image' | 'raw');

      if (!fileDetails) {
        return res.status(404).json({ message: 'File not found' });
      }

      // Generate download URL
      const downloadUrl = await generateDownloadUrl(public_id.toString(), resource_type as 'image' | 'raw');
      return res.redirect(downloadUrl);
    } catch (error) {
      console.error('Error handling file download:', error);
      return res.status(500).json({
        success: false,
        message: 'Error downloading file',
        error: (error as Error).message
      });
    }
  };
};