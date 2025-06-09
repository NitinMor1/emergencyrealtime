import {Router} from 'express';
const sampleRouter = Router();
import {  sampleRegistration, updateSampleRegistration, deleteSampleRegistration, getAllSampleByOrderId} from './sampleCollectionController';
import {verifyJWT} from '../../../auth/ctrl_func'

/*
sampleRouter.get('/getSample',verifyJWT, getSampleCollection);
sampleRouter.post('/createSample',verifyJWT, createSampleCollection);
sampleRouter.post('/updateSample',verifyJWT, updateSampleCollection);
sampleRouter.post('/deleteSample',verifyJWT, deleteSampleCollection);
sampleRouter.get('/getAllSample',verifyJWT,getAllSampleCollection );
*/

sampleRouter.get("/getRegisteredSample", verifyJWT, getAllSampleByOrderId);
sampleRouter.post("/registerSample",verifyJWT,  sampleRegistration);
sampleRouter.post("/updateSample", verifyJWT, updateSampleRegistration);
sampleRouter.post("/deleteRegisteredSample", verifyJWT, deleteSampleRegistration);


export default sampleRouter;