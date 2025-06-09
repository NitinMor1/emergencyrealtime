import { getChats, getNursesChat, getDoctorChat, getAllEmployeesChatList, uploadChatFile, searchMessages } from "./chatController";
import { Router } from "express";
import multer from 'multer';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

const chatRouter = Router();

chatRouter.route("/get").get(getChats);
chatRouter.route("/getNursesChat").get(getNursesChat);
chatRouter.route("/getDoctorChat").get(getDoctorChat);
chatRouter.route("/getAllEmployees").get(getAllEmployeesChatList);
chatRouter.route("/uploadFile").post(upload.single('file'), uploadChatFile);
chatRouter.route("/search").get(searchMessages);
export default chatRouter;