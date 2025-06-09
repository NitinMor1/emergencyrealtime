import { Router } from "express";
import {
  getAllEmployees,
  updatedEmployee,
  deleteEmployee,
  addEmployee,
  getEmployeeById,
  updatePendingPayroll,
  updateAttendance,
  // resetAttendance,
  markLeave,
  approveLeave,
  getDutyRoasterOfEmployee,
  createDutyRoaster,
  updateDutyRoaster,
  getAllLeaves,
  getGazettedLeaves,
  markGazettedLeaves,
  addAndUpdatePerformanceRemark,
  addHistoryPayrolls,
  clearAttendance,
  onBoardDoctor,
  getAllDutyRoster,
  getAllDutyRosterByDate,
  addMultipleDutyRoster,
  getSwitchedDuty,
  approveSwitchedDuty,
  findAvailableEmployees,
  deleteDutyRoster,
  getOverTime,
  approveOverTime,
  addSupervisor,
  addUsernameToEmployeeContactDetails,
  updateEmployeeSchema,
  getSubOrdinates,
  updateEmployeeRoleAccessFromMongoId,
  updateEmployeeRoleAccessBasedOnRole,
  updateSubordinatesRoleAccess,
  // utilsFuncion
} from "./hrContoller";
import {
  uploadAttendance
} from "./attendanceUploadController"
import { upload } from "../../auth/controller";
import { verifyJWT } from "../../auth/ctrl_func";

const hrRouter = Router();

// Employee Routes
hrRouter.route("/addEmployee").post(verifyJWT,  addEmployee);
hrRouter.route("/getAllEmployee").get(verifyJWT, getAllEmployees);
hrRouter.route("/getEmployeeById").get(verifyJWT, getEmployeeById);
hrRouter.route("/updateEmployee").post(verifyJWT, updatedEmployee);
hrRouter.route("/deleteEmployee").post(verifyJWT, deleteEmployee);
hrRouter.route("/onBoardDoctor").post(verifyJWT, onBoardDoctor);
hrRouter.route("/addSupervisor").post(verifyJWT, addSupervisor);
// hrRouter.route("/updateIt").put(addUsernameToEmployeeContactDetails);

// Attendance Routes & Payroll
hrRouter.route("/updatePendingPayroll").post(verifyJWT, updatePendingPayroll);
hrRouter.route("/updateAttendance").post(verifyJWT, updateAttendance);
hrRouter.route("/reset").post(verifyJWT, clearAttendance);
hrRouter.route("/markLeave").post(verifyJWT, markLeave);
hrRouter.route("/approveLeave").post(verifyJWT, approveLeave);
hrRouter.route("/getAllLeave").get(verifyJWT, getAllLeaves);
hrRouter.route("/getGazettedLeaves").get(verifyJWT, getGazettedLeaves);
hrRouter.route("/markGazettedLeaves").post(verifyJWT, markGazettedLeaves);
hrRouter.route("/addHistoryPayrolls").post(verifyJWT, addHistoryPayrolls);
hrRouter.route("/addAndUpdatePerformanceRemark").post(verifyJWT, addAndUpdatePerformanceRemark);
// hrRouter.route("/resetAttendance").post(clearEmployeeAttendance);

// DutyRoster
hrRouter.route("/getDutyRoster").get(verifyJWT, getAllDutyRoster);
hrRouter.route("/getAllDutyRosterByDate").get(verifyJWT, getAllDutyRosterByDate);
hrRouter.route("/getDutyRoasterOfEmployee").get(verifyJWT, getDutyRoasterOfEmployee);
hrRouter.route("/addDutyRoster").post(verifyJWT, createDutyRoaster);
hrRouter.route("/addMultipleDutyRoster").post(verifyJWT, addMultipleDutyRoster);
hrRouter.route("/updateDutyRoster").post(verifyJWT, updateDutyRoaster);
hrRouter.route("/deleteDutyRoster").post(verifyJWT, deleteDutyRoster);

// Switched Duty
hrRouter.route("/getSwitchedDuty").get(verifyJWT, getSwitchedDuty);
hrRouter.route("/approveSwitchedDuty").post(verifyJWT, approveSwitchedDuty);
hrRouter.route("/findAvailableEmployees").get(findAvailableEmployees);


// attendance upload
hrRouter.route("/uploadAttendance").post(verifyJWT, upload.single("file"), uploadAttendance);


//overTime request
hrRouter.route("/getOverTimeRequests").get(verifyJWT, getOverTime);
hrRouter.route("/approveOverTimeRequest").post(verifyJWT, approveOverTime);

// hrRouter.route("/util").post(utilsFuncion);
// hrRouter.route("/updateExistingData").put(updateEmployeeSchema);

// settingup role access
hrRouter.route("/addRoleAccess").get(verifyJWT, getSubOrdinates);
hrRouter.route("/roleAccessById").post(verifyJWT, updateEmployeeRoleAccessFromMongoId);
hrRouter.route("/roleAccessByRole").post(verifyJWT, updateEmployeeRoleAccessBasedOnRole);
hrRouter.route("/updateSubordinateRoleAccess").post(verifyJWT, updateSubordinatesRoleAccess);
export default hrRouter;