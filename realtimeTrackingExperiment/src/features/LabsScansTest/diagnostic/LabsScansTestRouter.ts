import { Router } from "express";
import orderRouter from "./TestOrder/orderRoutes"
import samplePreparationRouter from "./samplePreparation/samplePreparationRouter";
import sampleRouter from "./sampleCollection/sampleRoutes";
import taskAllocationRouter from "./taskAllocation/taskAllocationRouter";
import sampleTestingRouter from "./sampleTesting/sampleTestingRouter";
import resultValidationRouter from "./resultValidation/resultValidationRouter";
import testPackageRouter from "./testPackages/testPackagesRoute";
const diagnosticRouter = Router();

diagnosticRouter.use("/order", orderRouter);
diagnosticRouter.use("/sample", sampleRouter);
diagnosticRouter.use("/samplePreparation", samplePreparationRouter);
diagnosticRouter.use("/taskAllocation", taskAllocationRouter);
diagnosticRouter.use("/sampleTesting", sampleTestingRouter);
diagnosticRouter.use("/resultValidation", resultValidationRouter);
diagnosticRouter.use("/testPackages", testPackageRouter);
export default diagnosticRouter;