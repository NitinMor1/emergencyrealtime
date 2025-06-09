import { verifyJWT } from '../../auth/ctrl_func';
import { addPatientInfo, getPatientInfoById, getAllPatients, updatePatientVitals, getPatientsBySearch, getPatientsByMongoID } from './patientController'
import { Router } from "express";
const patientInfoRouter = Router();

patientInfoRouter.route("/").get(verifyJWT, getPatientsBySearch)
patientInfoRouter.route("/addPatients").post(verifyJWT, addPatientInfo);
patientInfoRouter.route("/getAllPatients").get(verifyJWT, getAllPatients);
patientInfoRouter.route("/getPatientById",).get(verifyJWT, getPatientInfoById);
patientInfoRouter.route("/updatePatientVitals").post(verifyJWT, updatePatientVitals);
patientInfoRouter.route("/getPatientByMongoId").get(verifyJWT, getPatientsByMongoID)
// patientInfoRouter.route("/checkIfUserNamePresent").post(checkIfUserNamePresent);

export default patientInfoRouter;