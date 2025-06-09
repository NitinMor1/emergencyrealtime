import { verifyJWT } from '../../../auth/ctrl_func';
import {orderTest, getTestOrder, getTestOrderById, deleteTestOrder, updateTestOrder} from './orderController'
import { Router } from 'express';

const orderRouter = Router();

orderRouter.route("/book").post(verifyJWT, orderTest);
orderRouter.route("/getAll").get(verifyJWT, getTestOrder);
orderRouter.route("/updateTest").put(verifyJWT, updateTestOrder);
orderRouter.route("/deleteTest").delete(verifyJWT, deleteTestOrder);
orderRouter.route("/getTestById").get(verifyJWT, getTestOrderById);

export default orderRouter;