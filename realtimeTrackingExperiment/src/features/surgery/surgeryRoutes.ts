import Router from 'express';
const surgeryRouter = Router();

import { getAllSurgeries, addSurgery, updateSurgery, deleteSurgery, getRoomFromIpd, getEquipment, getMedicines, addNurseToTeam, addMedicinesToSurgery, addEquipmentToSurgery, addIVToSurgery, addAnaesthesia, updateAnaesthesia, updateIV } from './surgeryController';
import { verifyJWT } from '../auth/ctrl_func';

surgeryRouter.route('/getAllSurgeries').get(verifyJWT, getAllSurgeries);
surgeryRouter.route('/addSurgery').post(verifyJWT, addSurgery);
surgeryRouter.route('/updateSurgery').post(verifyJWT, updateSurgery);
surgeryRouter.route('/deleteSurgery').post(verifyJWT, deleteSurgery);
surgeryRouter.route('/getRoomFromIpd').get(verifyJWT, getRoomFromIpd);
surgeryRouter.route('/getMedicines').get(verifyJWT, getMedicines);
surgeryRouter.route('/getEquipment').get(verifyJWT, getEquipment);
surgeryRouter.route('/addNurseToTeam').post(verifyJWT, addNurseToTeam);
surgeryRouter.route('/addMedicinesToSurgery').post(verifyJWT, addMedicinesToSurgery);
surgeryRouter.route('/addEquipmentToSurgery').post(verifyJWT, addEquipmentToSurgery);
surgeryRouter.route('/addIVToSurgery').post(verifyJWT, addIVToSurgery);
surgeryRouter.route('/addAnesthesia').post(verifyJWT, addAnaesthesia);
surgeryRouter.route('/updateAnaesthesia').post(verifyJWT, updateAnaesthesia);
surgeryRouter.route('/updateIV').post(verifyJWT, updateIV);

export default surgeryRouter;