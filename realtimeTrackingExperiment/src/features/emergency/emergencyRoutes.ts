import { Router } from "express";
import {
  getEmergency,
  createEmergency,
  updateEmergency,
  deleteEmergency,
  getAmbulanceList,
} from "./emergencyController";

// import { locationUpdate } from "./locationReceiver/socketIO";
import { verifyJWT } from "../auth/ctrl_func";
import { pullEmergencyNotification } from "./emergencyNotification/emergencyNotification";

const emergencyRouter = Router();

emergencyRouter.get("/getEmergency", verifyJWT, getEmergency);
emergencyRouter.post("/createEmergency",verifyJWT,  createEmergency);
emergencyRouter.post("/updateEmergency", verifyJWT, updateEmergency);
emergencyRouter.post("/deleteEmergency", verifyJWT, deleteEmergency);
emergencyRouter.get("/getAmbulanceList", verifyJWT, getAmbulanceList);

// emergencyRouter.route("/locationUpdate").post(locationUpdate);


emergencyRouter.get("/getEmergencyNotification", verifyJWT, pullEmergencyNotification)
export default emergencyRouter;