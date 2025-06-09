import { verifyJWT } from "../auth/ctrl_func";
import {
    addEquipments, getEquipments,
    updateEquipments, deleteEquipment
} from "./equipmentsController";

import { Router } from "express";
const equipmentsRouter = Router();
equipmentsRouter.route('/getEquipments').get(verifyJWT, getEquipments);
equipmentsRouter.route('/addEquipments').post(verifyJWT, addEquipments);
equipmentsRouter.route('/updateEquipments').post(verifyJWT, updateEquipments);
equipmentsRouter.route('/deleteEquipment').post(verifyJWT, deleteEquipment);
export default equipmentsRouter;