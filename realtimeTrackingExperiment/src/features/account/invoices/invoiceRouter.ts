import { Router } from "express";
import {
  addINvoiceValidate,
  addInvoiceValidationRules,
  generateInvoice,
  getInvoices,
  deleteInvoice,
  updatePendingInvoice,
  updateInvoice,
  getPendingInvoice,
  generateOpdBills,
  getOpdBills,
  updateOpdBill,
  getOpdBillByid,
  generateTestBill,
  getTestBills,
  updateTestBill,
  getTestBillById,
} from "./controllers/invoiceController";

import {
  addIpdBill,
  addMedicine,
  addProcedure,
  addService,
  deleteIpdBill,
  deleteMedicine,
  deleteProcedure,
  deleteService,
  genIpdBill,
  getIpdBills,
  updateConsultationCharges,
  updateInsuranceCoverage,
  updateIpdBill,
  updateMedicine,
  updateProcedure,
  updateRoomCharges,
  updateService,
  updateTaxes,
  getIpdBillsById,
  getTestBillByMongoId
} from "./controllers/ipdBillingController";


import { verifyJWT } from "../../auth/ctrl_func";

const invoiceRouter = Router();

invoiceRouter.route("/generateInvoice").post(verifyJWT, addInvoiceValidationRules, addINvoiceValidate, generateInvoice);
invoiceRouter.route("/getInvoices").get(verifyJWT, getInvoices);
invoiceRouter.route("/deleteInvoice").post(verifyJWT, deleteInvoice);
invoiceRouter.route("/updatePendingInvoice").post(verifyJWT, updatePendingInvoice);
invoiceRouter.route("/updateInvoice").post(verifyJWT, updateInvoice);
invoiceRouter.route("/getPendingInvoice").get(verifyJWT, getPendingInvoice);

// OPD Routes
invoiceRouter.route("/generateOpdBills").post(verifyJWT, generateOpdBills);
invoiceRouter.route("/getOpdBills").get(verifyJWT, getOpdBills);
invoiceRouter.route("/updateOpdBill").post(verifyJWT, updateOpdBill);
invoiceRouter.route("/getOpdBillByid").post(verifyJWT, getOpdBillByid);

// IPD Routes
invoiceRouter.route("/addIpdBill").post(verifyJWT, addIpdBill);
invoiceRouter.route("/getIpdBills").get(verifyJWT, getIpdBills);
invoiceRouter.route("/getIpdBillById").get(verifyJWT, getIpdBillsById);
invoiceRouter.route("/genIpdBill").post(verifyJWT, genIpdBill);
invoiceRouter.route("/updateIpdBill").post(verifyJWT, updateIpdBill);

invoiceRouter.route("/addService").post(verifyJWT, addService);
invoiceRouter.route("/updateService").post(verifyJWT, updateService);
invoiceRouter.route("/deleteService").post(verifyJWT, deleteService);

invoiceRouter.route("/addMedicine").post(verifyJWT, addMedicine);
invoiceRouter.route("/updateMedicine").post(verifyJWT, updateMedicine);
invoiceRouter.route("/deleteMedicine").post(verifyJWT, deleteMedicine);

invoiceRouter.route("/addProcedure").post(verifyJWT, addProcedure);
invoiceRouter.route("/updateProcedure").post(verifyJWT, updateProcedure);
invoiceRouter.route("/deleteProcedure").post(verifyJWT, deleteProcedure);

invoiceRouter.route("/updateRoomCharges").post(verifyJWT, updateRoomCharges);
invoiceRouter.route("/updateTaxes").post(verifyJWT, updateTaxes);
invoiceRouter.route("/updateConsultationCharges").post(verifyJWT, updateConsultationCharges);
invoiceRouter.route("/updateInsuranceCoverage").post(verifyJWT, updateInsuranceCoverage);
invoiceRouter.route("/deleteIpdBill").post(verifyJWT, deleteIpdBill);

// Test billing Routes
invoiceRouter.route("/generateTestBill").post(verifyJWT, generateTestBill);
invoiceRouter.route("/getTestBills").get(verifyJWT, getTestBills);
invoiceRouter.route("/updateTestBill").post(verifyJWT, updateTestBill);
invoiceRouter.route("/getTestBillById").get(verifyJWT, getTestBillById);

// get test bills by Id
invoiceRouter.route("/getTestBillByMongoId").get(verifyJWT, getTestBillByMongoId);
export default invoiceRouter;
