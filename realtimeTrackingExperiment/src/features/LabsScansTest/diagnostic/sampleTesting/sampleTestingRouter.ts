import { Router } from 'express';
import { initiateSampleTesting, getSampleTesting, updateSampleTesting, deleteSampleTesting, getAllSampleTesting } from './sampleTestingController';
import { verifyJWT } from '../../../auth/ctrl_func';

const sampleTestingRouter = Router();

sampleTestingRouter.route("/initiateSampleTesting").post( initiateSampleTesting);
sampleTestingRouter.route("/getSampleTesting").get(verifyJWT, getSampleTesting);
sampleTestingRouter.route("/updateSampleTesting").post(verifyJWT, updateSampleTesting);
sampleTestingRouter.route("/deleteSampleTesting").post(verifyJWT, deleteSampleTesting);
sampleTestingRouter.route("/getAllSampleTesting").get(verifyJWT, getAllSampleTesting);

export default sampleTestingRouter;