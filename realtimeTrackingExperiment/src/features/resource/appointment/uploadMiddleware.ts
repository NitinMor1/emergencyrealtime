import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

export const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|png|jpeg|jpg|webp|hiec/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error("Error: PDF files only!"));
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024, // 100 MB limit
    },
});