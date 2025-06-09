import { Router } from "express";
import { startResultValidation, getResultValidation, updateResultValidation, deleteResultValidation, getAllResultValidation } from "./resultValidationController";
import { verifyJWT } from "../../../auth/ctrl_func";


const resultValidationRouter = Router();

resultValidationRouter.route("/startResultValidation").post(verifyJWT, startResultValidation);
resultValidationRouter.route("/getResultValidation").get(verifyJWT, getResultValidation);
resultValidationRouter.route("/updateResultValidation").post(verifyJWT, updateResultValidation);
resultValidationRouter.route("/deleteResultValidation").post(verifyJWT, deleteResultValidation);
resultValidationRouter.route("/getAllResultValidation").get(verifyJWT, getAllResultValidation);

export default resultValidationRouter;