import { IRoom } from "../../auth/HospitalModel";
export interface IEmployee {
  hospitalId: string;
  ContactDetails: ContactDetails;
  HR: IHR;
}

export interface ContactDetails {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  employeeId: string;
  username?: string;
  profilePicture?: {
    id: string;
    url: string;
  }
}

export interface IHR {
  joining_date: string;
  total_payable_salary: number | 0;
  total_paid_salary: number | 0;
  leaving_date: string | null;
  salary: number;
  // role?: IADMIN;
  role: {
    role: IADMIN;
    customName?: string;
  }
  department?: string;
  // supervisor?: string;
  supervisor?: string[];
  subordinates: string[];
  no_of_leave?: number | null;
  no_of_absent?: number | null; // unpaid -> buffer time 15 min for late comers
  attendance: IAttendance[];
  performance_remarks: IRemark[] | null; // appreciation or anything else
  history_payroll: IPayroll[];
  shift: IShift;
  actual_working_hours: number;
  extra_working_hours: number | 0;
  dutyRoster: IDutyRoster[];
  allLeaves: ILeaveType[];
  roleAccess?: string[];
  availabilityStatus?: 'Available' | 'Occupied' | 'On Leave'
}

export interface ILeaveType {
  date: string;
  leaveType: ILT;
}

export enum ILT {
  CasualLeave = "casual leave",
  SickLeave = "sick leave",
  MaternityLeave = "maternity leave",
  PaternityLeave = "paternity leave",
  NOLEAVE = "no leave",
  OTHER = "other"
}

export interface IAttendance {
  empId: string;
  date: string;
  checkInTime: string;
  checkInTimeInISO: string;
  checkOutTime: string;
  checkOutTimeInISO: string;
  onLeave: boolean | null;
  leave_reason: string | undefined;
  absent: boolean | null;
  approved: Approved;
  leaveType: ILT;
}
export enum Approved {
  APPROVED = "approved",
  PENDING = "pending",
  REJECTED = "rejected",
  NOLEAVE = "no leave"
}
export interface IDutyRoster {
  date: string;
  shift: IShift;
  employeeId: string;
  location: IRoom | string;
  availability: boolean;
  start: string;
  end: string;
  isOvertime?: boolean | false;
  overTime?: number;
  isSwitched?: boolean;
  switchEmpId?: string;
  approved?: boolean;
}

export enum IShift {
  MORNING = "morning",
  EVENING = "evening",
  NIGHT = "night"
}

export enum IADMIN {
  ADMIN = "admin",
  DOCTOR = "doctor",
  HR = "hr",
  FINANCE = "finance",
  NURSE = "nurse",
  COMPOUNDER = "compounder",
  Paramedic = "paramedics",
  Pharma = "pharma",
  DRIVER = "driver",
  RECEPTIONIST = "Receptionist",
  LAB_TECHNICIAN = "lab_technician",
  LAB_ASSISTANT = "lab_assistant",
}
export interface IRemark {
  date: string;
  employeeId: string;
  reviewerName: string;
  review_title: string;
  review_purpose: string;
  review_rating: number;
  task: string;
  work_done: string;
  blockages: string;
  accomplishments: string;
  training: string;
  durationOfOverTime: number; // in hours --> 60 min.
}

export interface IPayroll {
  allowances: number;
  deductions: number;
  status: payrollStatus;
  payment_dates: string;
}

export enum payrollStatus {
  PENDING = "pending",
  PAID = "paid",
}

export interface IGazettedLeaves {
  date: string;
  occasion: string;
}

export interface INotification {
  startingDate: string | Date;
  endingDate: string | Date;
  message: string;
  SwitchEmpId: string;
  requestCreatedBy: string;
  approved: boolean;
}

export interface IOverTime {
  empId: string;
  date: string;
  overTime: number;
  startTime?: string;
  approved: boolean;
}

/* 
"date":"2021-09-01",
"employeeId":"emp_9NZ",
"reviewerName":"Dr. Alok",
"review_title":"Performance Review",
"review_purpose":"To review the performance of the employee",
"review_rating":4,
"task":"To check the patient's health",
"work_done":"Checked the patient's health",
"blockages":"None",
"accomplishments":"None",
"training":"None",
"durationOfOverTime":2
*/