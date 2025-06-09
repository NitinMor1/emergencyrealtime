export interface IUpload {
    hospitalId: string | null;
    uploadedBy: {
        user: EUploadUser,
        userId: string // patientUsername, employee id, doctorUsername
    };
    fileName: string;
    fileType: EUploadFileType,
    format: EUploadFileFormat,
    tags: EUploadTags[]
    cloudinary: {
        url: string,
        publicId: string,
    },
    uploadedAt: string | Date;
    updatedAt: string | Date;

}

export enum EUploadUser {
    PATIENT = "Patient",
    DOCTOR = "Doctor",
    EMPLOYEE = "Employee" // every employee on hplus and mplus
}

export enum EUploadFileType {
    IMG = "image",
    PDF = "pdf",
    DIACOM = "dcm"
}

export enum EUploadFileFormat {
    PNG = "png",
    JPG = "jpg",
    JPEG = "jpeg",
    PDF = "pdf",
    DCM = "dcm"
}

export enum EUploadTags {
    PROFILE = "Profile",
    SCAN = "Scan",
    HEADER = "Header",
    FOOTER = "Footer",
    LOGO = "Logo"
}