import { Router } from "express";
import {getTestOrder, getTestOrderById} from './orderrNotificationController'
import { verifyJWT } from "../../auth/ctrl_func";
const orderNotificationRouter = Router();


orderNotificationRouter.get("/getAllNotifications", verifyJWT,getTestOrder )
orderNotificationRouter.get("/getNotificationById", verifyJWT,getTestOrderById )

export default orderNotificationRouter;