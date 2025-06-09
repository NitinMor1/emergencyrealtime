import { verifyJWT } from "../auth/ctrl_func";
import { getAllDynamicForms } from "./forms";
import { Router } from "express";

const formRouter = Router();

formRouter.get("/getForms", verifyJWT, getAllDynamicForms);

export default formRouter;