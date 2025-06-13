import { Router } from "express";
import { createEmergency, createPartialEmergency, deleteEmergency, getAvailableResources, updateEmergencyAssignees, updateEmergencyStatus, getEmergency } from "./emergencyController";

import { verifyJWT } from "../auth/ctrl_func";

const emergencyRouter = Router();

emergencyRouter.route("/createEmergency").post(verifyJWT, createEmergency)
emergencyRouter.route("/createAutoAssignedEmergency").post(verifyJWT, createPartialEmergency);
emergencyRouter.route("/updateAssignees").put(verifyJWT, updateEmergencyAssignees);
emergencyRouter.route("/get").get(verifyJWT, getEmergency);
emergencyRouter.route("/delete").delete(verifyJWT, deleteEmergency);
emergencyRouter.route("/updateEmergencyStatus").put(verifyJWT, updateEmergencyStatus);
emergencyRouter.route("/getAvailableResources").get(verifyJWT, getAvailableResources);


export default emergencyRouter;