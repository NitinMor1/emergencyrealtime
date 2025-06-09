import { Router } from 'express';
import { getUhidNumber, SetUhidNumber, updateAccount, updateHospitalDetailsAccordingToNewModel, UpdateSpacings } from "./AccountManager";
import { verifyJWT } from '../auth/ctrl_func';
const accountRouter: Router = Router();

accountRouter.route("/updateAccount").post(verifyJWT, updateAccount);
accountRouter.route("/UpdateSpacings").post(verifyJWT, UpdateSpacings);
accountRouter.route("/getUhidNumber").get(verifyJWT, getUhidNumber);
accountRouter.route("/SetUhidNumber").post(verifyJWT, SetUhidNumber);
// accountRouter.route("/updateDetails").put( updateHospitalDetailsAccordingToNewModel);

export default accountRouter;