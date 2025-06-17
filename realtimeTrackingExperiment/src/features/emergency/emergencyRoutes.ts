import { Router } from "express";
import { createEmergency, createPartialEmergency, deleteEmergency, getAvailableResources, updateEmergencyAssignees, updateEmergencyStatus, getEmergency, getEmergencyForME, getAssignedEmergency, getPendingEmergency, getAllEmergency } from "./emergencyController";

import { verifyJWT } from "../auth/ctrl_func";

const emergencyRouter = Router();

emergencyRouter.route("/createEmergency").post(verifyJWT, createEmergency)
emergencyRouter.route("/createAutoAssignedEmergency").post(verifyJWT, createPartialEmergency);
emergencyRouter.route("/updateAssignees").put(verifyJWT, updateEmergencyAssignees);
emergencyRouter.route("/getAllCreatedEmergency").get(verifyJWT, getEmergency);
emergencyRouter.route("/getAllEmergency").get(verifyJWT, getAllEmergency)
emergencyRouter.route("/delete").delete(verifyJWT, deleteEmergency);
emergencyRouter.route("/updateEmergencyStatus").put(verifyJWT, updateEmergencyStatus);
emergencyRouter.route("/getAvailableResources").get(verifyJWT, getAvailableResources);
emergencyRouter.route("/getPendingEmergency").get(verifyJWT, getPendingEmergency)


// will be shifting to ME
emergencyRouter.route("/getEmergency").get(verifyJWT, getEmergencyForME)

// will be shifting to M+
emergencyRouter.route("/getAssignedEmergency").get(verifyJWT, getAssignedEmergency)

export default emergencyRouter;