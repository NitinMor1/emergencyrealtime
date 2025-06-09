import express from "express";
import { validateAppointment } from "./ValidationMiddleware"
const appointmentRouter = express.Router();

import {
  getAllScans,
  addScan,
  deleteScans,
  updateScan,
  addAppointment,
  fetchAppointments,
  fetchAllAppointment,
  updateAppointment,
  deleteAppointment,
  addScanDone,
  getNotification,
  notificationRead,
  fetchPendingAppointments,
  fetchOldAppointment,
  fetchUpcomingAppointments,
  fetchAllUpcomingAppointments,
  isNewOpdInBetweenTheFreeInterval,
  countAppointmentPerPatient,
  completeAppointment,
  // deleteAllScans
} from "./AppointmentController";
import { getPdf, uploadPdf, getPdfsList, deletePdf, updatePdf, uploadOnCloudinary, getPDFsListFromCloudinary, downloadPdfFromCloudinary, deletePdfFromCloudinary } from "./uploadController";
import { upload } from "./uploadMiddleware";
import { verifyJWT } from "../../auth/ctrl_func";
import { handleDelete, handleUpload, handleFileDownload, CloudinaryExtendedRequest } from "../../../utils/cloudinary/cloudinary.controllers";

appointmentRouter.route("/addScan").post(verifyJWT, addScan);
appointmentRouter.route("/addScanDone").post(verifyJWT, addScanDone);
appointmentRouter.route("/allScans").get(verifyJWT, getAllScans);
appointmentRouter.route("/updateScan").post(verifyJWT, updateScan);
appointmentRouter.route("/deleteScans").post(verifyJWT, deleteScans);
// appointmentRouter.route("/deleteAllScans").post(deleteAllScans)

// Routes for Appointments

appointmentRouter.route("/addAppointment").post(verifyJWT, addAppointment);
appointmentRouter.route("/fetchAppointments").get(verifyJWT, fetchAppointments);
appointmentRouter.route("/fetchAllAppointment").get(verifyJWT, fetchAllAppointment);
appointmentRouter.route("/updateAppointment").post(verifyJWT, updateAppointment);
appointmentRouter.route("/deleteAppointment").post(verifyJWT, deleteAppointment);

appointmentRouter.route("/fetchUpcoming").post(verifyJWT, fetchUpcomingAppointments);
appointmentRouter.route("/fetchAllUpcoming").get(verifyJWT, fetchAllUpcomingAppointments);

appointmentRouter.route("/getpendingAppointments").get(verifyJWT, fetchPendingAppointments);
appointmentRouter.route("/completeAppoinment").post(verifyJWT, completeAppointment);
appointmentRouter.route("/getOldOPD").get(verifyJWT, fetchOldAppointment);

//upload route
appointmentRouter.route("/upload").post(verifyJWT, upload.single("file"), uploadPdf);
appointmentRouter.route("/downloadPdf/:hospitalId/:id").get(getPdf);
appointmentRouter.route("/getPdfsList").get(verifyJWT, getPdfsList);
appointmentRouter.route("/deletePdf/:hospitalId/:id").post(verifyJWT, deletePdf);
appointmentRouter.route("/updatePdf/:hospitalId/:id").post(verifyJWT, upload.single("file"), updatePdf);

// cloudinary upload routes
appointmentRouter.route("/cloudinary/upload").post(verifyJWT, handleUpload("file"), uploadOnCloudinary)

appointmentRouter.route("/cloudinary/getPdfList").get(verifyJWT, getPDFsListFromCloudinary);

appointmentRouter.route("/cloudinary/downloadPdf").get(downloadPdfFromCloudinary, handleFileDownload());

appointmentRouter.route("/cloudinary/deletePdf").delete(verifyJWT, deletePdfFromCloudinary);

//Notification route

appointmentRouter.route("/getNotification").get(verifyJWT, getNotification);
appointmentRouter.route("/notificationRead").get(verifyJWT, notificationRead);

appointmentRouter.route("/checkIfFreeInterval").get(verifyJWT, isNewOpdInBetweenTheFreeInterval);
appointmentRouter.route("/appointmentCount").get(verifyJWT, countAppointmentPerPatient);

export default appointmentRouter;
