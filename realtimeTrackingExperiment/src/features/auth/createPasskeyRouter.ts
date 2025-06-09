import { Router } from "express";
import { createPasskey } from "./controller";
const passkeyRouter = Router();

passkeyRouter.route("/createPasskey").post(createPasskey);

export default passkeyRouter;