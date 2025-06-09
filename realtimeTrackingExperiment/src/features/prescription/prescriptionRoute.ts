import { Router } from "express";
import { verifyJWT } from "../auth/ctrl_func";
import { getPrescription } from "./prescriptionController";


const prescriptionRouter = Router();

prescriptionRouter.route("/get").get(verifyJWT, getPrescription);

export default prescriptionRouter;