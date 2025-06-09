import { verifyJWT } from "../../auth/ctrl_func";
import { createAlert, getAlerts, updateAlert, deleteAlert } from "./emergencyAlertController";
import { Router } from "express";
const emergencyAlertRouter = Router();

emergencyAlertRouter.route("/getAlerts").get(verifyJWT, getAlerts);
emergencyAlertRouter.route("/createAlert").post(verifyJWT, createAlert);
emergencyAlertRouter.route("/updateAlert").post(verifyJWT, updateAlert);
emergencyAlertRouter.route("/deleteAlert").post(verifyJWT, deleteAlert);

export default emergencyAlertRouter;