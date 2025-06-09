import {Router} from 'express';
import { verifyJWT } from '../../../auth/ctrl_func';
import {getAllTestPackages, addTestPackage, updateTestPackage, deleteTestPackage} from './testPackagesController'
import test from 'node:test';
const testPackageRouter = Router();

testPackageRouter.route("/getTestPackages").get(verifyJWT, getAllTestPackages);
testPackageRouter.route("/addTestPackage").post(verifyJWT, addTestPackage);
testPackageRouter.route("/updateTestPackage").put(verifyJWT, updateTestPackage);
testPackageRouter.route("/deleteTestPackage").delete(verifyJWT, deleteTestPackage);

export default testPackageRouter;