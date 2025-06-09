import { Router } from "express";
import {
    createItem,
    deleteItem,
    getAllDevice,
    getAllItems, getAllMedicine, getItemById, updateItem
} from "./inventoryController";import {
    ItemSchema,
    ItemUpdateSchema,
    ItemQuerySchema,
} from './Validation.schema';
import { validateBody, validateQuery } from "./ValidationMidlelware";
import { verifyJWT } from "../../auth/ctrl_func";
const inventoryRouter = Router();

inventoryRouter.route("/getAllItems").get(verifyJWT, validateQuery(ItemQuerySchema), getAllItems);
inventoryRouter.route("/getAllMedicine").get(verifyJWT, validateQuery(ItemQuerySchema),getAllMedicine);
inventoryRouter.route("/getAllDevice").get(verifyJWT,validateQuery(ItemQuerySchema), getAllDevice);
inventoryRouter.route("/createItem").post(verifyJWT, validateBody(ItemSchema), createItem);
inventoryRouter.route("/updateItem").post(verifyJWT, validateBody(ItemUpdateSchema), updateItem);
inventoryRouter.route("/deleteItem").post(verifyJWT, validateBody(ItemSchema), deleteItem);
inventoryRouter.route("/getItemById").get(verifyJWT, validateBody(ItemSchema),getItemById);

export default inventoryRouter;