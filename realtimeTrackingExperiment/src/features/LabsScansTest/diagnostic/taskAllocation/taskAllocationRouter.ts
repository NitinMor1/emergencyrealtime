import { Router } from "express";
import { verifyJWT } from "../../../auth/ctrl_func";
import { allocateTask, updateTaskAllocation, deleteTaskAllocation, getAllTaskAllocationByorderId, getAllTaskAllocationBySampleId, } from './taskAllocationController'

const taskAllocationRouter = Router();

taskAllocationRouter.route("/allocateTask").post( verifyJWT,allocateTask);
taskAllocationRouter.route("/updateTaskAllocation").post(verifyJWT, updateTaskAllocation);
taskAllocationRouter.route("/deleteTaskAllocation").post(verifyJWT, deleteTaskAllocation);
taskAllocationRouter.route("/getAllTaskAllocationByOrderId").get(verifyJWT, getAllTaskAllocationByorderId);
taskAllocationRouter.route("/getAllTaskAllocationBySampleId").get(verifyJWT, getAllTaskAllocationBySampleId);

export default taskAllocationRouter;