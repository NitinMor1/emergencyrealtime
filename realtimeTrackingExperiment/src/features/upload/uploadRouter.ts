import Express from "express";
import { verifyJWT } from "../auth/ctrl_func";
import { handleUpload } from "../../utils/cloudinary/cloudinary.controllers";
import { uploadFooterOrHeader, uploadLogo, validateHospitalImageReq } from "./uploadController";


const router = Express.Router();

router.route("/hospital").post(verifyJWT, handleUpload("file"), validateHospitalImageReq, uploadFooterOrHeader)
router.route("/hospital/logo").post(verifyJWT, handleUpload("file"), validateHospitalImageReq, uploadLogo)

export default router;