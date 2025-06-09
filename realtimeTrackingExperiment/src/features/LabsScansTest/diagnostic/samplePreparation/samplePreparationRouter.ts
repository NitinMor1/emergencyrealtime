import { Router } from "express";
import { verifyJWT } from "../../../auth/ctrl_func";
import {getAllSamplePreparation, initiateSamplePreparation, updateSamplePreparation, deleteSamplePreparation} from './samplePreparationController'

const samplePreparationRouter = Router();

samplePreparationRouter.route("/getAllSamplePreparation").get(verifyJWT, getAllSamplePreparation);
samplePreparationRouter.route("/initiateSamplePreparation").post(verifyJWT, initiateSamplePreparation);
samplePreparationRouter.route("/updateSamplePreparation").post(verifyJWT, updateSamplePreparation);
samplePreparationRouter.route("/deleteSamplePreparation").post(verifyJWT, deleteSamplePreparation);

export default samplePreparationRouter;