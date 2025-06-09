import express from "express";
const todoRouter = express.Router();
import {
  addTask,
  updateTask,
  deleteTask,
  getTasks,
  getTasksByCreaterId,
  getTasksByAssigneeId,
} from "./todoController";
import { verifyJWT } from "../auth/ctrl_func";
import { validateBody, validateQuery } from './validate';
import { todoSchema, hospitalIdQuerySchema, updateTaskSchema } from './todoSchema';


todoRouter.get("/get", verifyJWT,validateQuery(hospitalIdQuerySchema), getTasks);
todoRouter.get("/getTasksByCreatorId", verifyJWT, validateQuery(hospitalIdQuerySchema),getTasksByCreaterId);
todoRouter.get("/getTasksByAssigneeId", verifyJWT, validateQuery(hospitalIdQuerySchema), getTasksByAssigneeId);
todoRouter.post("/add", verifyJWT,  validateBody(todoSchema),addTask);
todoRouter.post("/update", verifyJWT,  validateBody(todoSchema),updateTask);
todoRouter.post("/delete", verifyJWT,  validateBody(todoSchema),deleteTask);

export default todoRouter;