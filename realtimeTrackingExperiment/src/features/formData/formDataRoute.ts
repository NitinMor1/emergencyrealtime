import { Router } from "express";
import { addData, deleteData, fetchDataFromAllForms, getDataById, updateData } from "./formDataController";
import { verifyJWT } from "../auth/ctrl_func"

const formDataRouter = Router();

formDataRouter.post("/addData", verifyJWT, addData)
formDataRouter.post("/getDataById", verifyJWT, getDataById)
formDataRouter.post("/updateData", verifyJWT, updateData)
formDataRouter.post("/deleteData", verifyJWT, deleteData)


formDataRouter.get("/getAllFormsData", verifyJWT, fetchDataFromAllForms)

export default formDataRouter;