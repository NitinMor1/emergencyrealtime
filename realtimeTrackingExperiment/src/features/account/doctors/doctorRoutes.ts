import { Router } from "express";
import { getDoctor, getDutySchedule,/* updateDoctorDataWithNewModel */ } from "./doctorController";
import { verifyJWT } from "../../auth/ctrl_func";
const doctorRouter = Router();

doctorRouter.route("/getDoctor").get(verifyJWT, getDoctor);
doctorRouter.route("/getDutySchedule").get(verifyJWT, getDutySchedule);
// doctorRouter.route("/updateDoctorData").put(updateDoctorDataWithNewModel)
export default doctorRouter;