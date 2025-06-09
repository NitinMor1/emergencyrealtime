import { Router } from "express";
import { getVendorByItemName, getItemNames, getVendors } from "./vmsController";
import { verifyJWT } from "../../auth/ctrl_func";

const vmsRouter = Router();

vmsRouter.get("/getVendors", verifyJWT, getVendors);
vmsRouter.get("/getItemNames", verifyJWT, getItemNames);
vmsRouter.get("/getVendorByItemName", verifyJWT, getVendorByItemName);

export default vmsRouter;