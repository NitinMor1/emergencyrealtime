import { verifyJWT } from '../../auth/ctrl_func';
import {getAllNotification} from './investigationController';
import { Router } from 'express';

const notificationRouter = Router();

notificationRouter.route("/fetchAllNotification").get( verifyJWT, getAllNotification);

export default notificationRouter;