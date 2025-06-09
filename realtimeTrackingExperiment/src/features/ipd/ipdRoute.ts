import { Router } from "express";
const ipdRouter = Router();

import {
  getPatients,
  addPatient,
  updatePatient,
  deletePatient,
  addPatientVitals,
  addDrugInfusionSheet,
  addDrugOrderSheet,
  addNonDrugOrderSheet,
  getDrugName,
  ipdHistory,
  getIPDById,
  countOccupiedBedInIpd,
  updateDrugInfusionSheet,
  updateDrugOrderSheet,
  updateNonDrugOrderSheet,
  updateVisitHistory,
  createPlanOfCare,
  getPlanOfCare,
  updatePlanOfCare,
  deletePlanOfCare,
  dynamicIpdController,
  getDynamicFormData,
  addEquipmentToIPD,
  addPatientMovement,
  updatePatientMovement,
  deleteVital,
  addLab
} from "./ipdController";
import { verifyJWT } from "../auth/ctrl_func";
import { fetchIcdCodes } from "./icdCodeController";

ipdRouter.route("/getPatients").get(verifyJWT, getPatients);
ipdRouter.route("/ipdHistory").get(verifyJWT, ipdHistory);
ipdRouter.route("/addPatients").post(verifyJWT, addPatient);
ipdRouter.route("/updatePatient").post(verifyJWT, updatePatient);
ipdRouter.route("/deletePatient").post(verifyJWT, deletePatient);
ipdRouter.route("/addVitals").post(verifyJWT, addPatientVitals);
ipdRouter.route("/deleteVitals").post(verifyJWT, deleteVital);
ipdRouter.route("/addDrugInfusionSheet").post(verifyJWT, addDrugInfusionSheet);
ipdRouter.route("/addDrugOrderSheet").post(verifyJWT, addDrugOrderSheet);
ipdRouter.route("/addNonDrugOrderSheet").post(verifyJWT, addNonDrugOrderSheet);
ipdRouter.route("/getIPDById").get(verifyJWT, getIPDById);
ipdRouter.route("/countOccBed").get(verifyJWT, countOccupiedBedInIpd);
ipdRouter.route("/addEquipmentToIpd").post(verifyJWT, addEquipmentToIPD);
// routers to get drug names
ipdRouter.route("/drugName").get(verifyJWT, getDrugName);

// update routes
ipdRouter.route("/updateDrugInfusionSheet").put(verifyJWT, updateDrugInfusionSheet)
ipdRouter.route("/updateDrugOrderSheet").put(verifyJWT, updateDrugOrderSheet)
ipdRouter.route("/updateNonDrugOrderSheet").put(verifyJWT, updateNonDrugOrderSheet)
ipdRouter.route("/updateVisitHistory").put(verifyJWT, updateVisitHistory)

ipdRouter.route("/addPlanOfCare").post(createPlanOfCare);
ipdRouter.route("/getPlanOfCare").get(getPlanOfCare);
ipdRouter.route("/updatePlanOfCare").put(updatePlanOfCare);
ipdRouter.route("/deletePlanOfCare").delete(deletePlanOfCare);

ipdRouter.route("/addPatientMovement").post(verifyJWT, addPatientMovement);
ipdRouter.route("/updatePatientMovement").post(verifyJWT, updatePatientMovement);


ipdRouter.route("/dipd").post(dynamicIpdController);
ipdRouter.route("/dipd").get(getDynamicFormData);



ipdRouter.route("/getIcdCodes").get(verifyJWT, fetchIcdCodes);

ipdRouter.route("/addLab").post(verifyJWT, addLab)

export default ipdRouter;

/*
    /api/ipd/addDrugInfusionSheet?hospitalId=hos_7BA7CF&id={mongoId};
    /api/ipd/addDrugOrderSheet?hospitalId=hos_7BA7CF&id={mongoId};
    /api/ipd/addNonDrugOrderSheet?hospitalId=hos_7BA7CF&id={mongoId};
*/
