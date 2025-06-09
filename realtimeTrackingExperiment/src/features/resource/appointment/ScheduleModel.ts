export interface IAppointment {
  hospitalId: string;
  title: string;
  time: string; // booking date means local current time in ISO format
  location: string;
  type: EventType;
  status: AppointmentStatus;
  patientUsername: string,
  patientName: string,
  patientPhoneNumber: string,
  doctorUsername: string; // DoctorId
  doctorName: string;
  eventData: IAppointmentData;
  isPayementConfirmed?: boolean;
  isApplicableForDiscount?: boolean;
}

export enum AppointmentStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  CANCELLED = 'Cancelled',
  COMPLETED = 'Completed',
}


export enum EventType {
  APPOINTMENT = 'Appointment',
}

export interface IAppointmentData {
  eventDate: string | Date; // iso format
  eventTime: string; // iso format
  eventTimeSlot: string; // will be sent from backend
  problem: string;
  appointment_number: number;
  priority: number;
  medocCardUrl: string;
}


export interface ILabScan {
  hospitalId: string;
  hospitalName: string;
  patientUsername: string;
  patientName: string;
  patientPhoneNumber: string;
  DOB: string;
  prescipDoctor: string;
  doctorUsername: string;
  performingDoc: string;
  type: string;
  date: string;
  note: string | undefined;
  contents: ITestResult[];
  filePath: string;
  uploaded_by: string;
  uploaded_At: string;
  downloaded_by: string[];
  downloaded_at: string[];
  createdAt: string;
  updatedAt: string;
  department: string;
  ScanResult: IScanResult[];
  isLab: boolean; // true -> Lab || false -> Scan
}

export interface IScanResult {
  image: string;
  description: string;
}

export interface NotifyLabScan {
  hospitalId: string;
  patientUsername: string;
  patientName: string;
  date: string;
  time: string;
  doctorUsername: string;
  doctorName: string;
  invesigation: string;
  notification: notify;
}

export enum notify {
  read = 'read',
  unread = 'unread'
}

interface ITestResult {
  test_name: string;
  result_value: string;
  unit: string;
  ref_range: string;
  expiry: string;
}

export interface IPdf {
  hospitalId: string;
  title: string;
  filename: string;
  contentType: string;
  length: number;
  uploadDate: Date;
  metadata?: {
    [key: string]: any;
  };
}

export const SLOTINDEXES = [
  "0000-0100",
  "0100-0200",
  "0200-0300",
  "0300-0400",
  "0400-0500",
  "0500-0600",
  "0600-0700",
  "0700-0800",
  "0800-0900",
  "0900-1000",
  "1000-1100",
  "1100-1200",
  "1200-1300",
  "1300-1400",
  "1400-1500",
  "1500-1600",
  "1600-1700",
  "1700-1800",
  "1800-1900",
  "1900-2000",
  "2000-2100",
  "2100-2200",
  "2200-2300"]



/*
appointment json data
{
  "hospitalId": "hos_7BA7CF",
  "title": "Appointment",
  "time": "2021-10-10T10:00:00Z",
  "location": "location",
  "type": "Appointment",
  "patientUsername": "pat_12BA23",
  "doctorUsername": "doc_45CD59",
  "eventData": {
    "date": "2021-10-10",
    "timeSlot": "1000-1200",
    "problem": "fever",
    "appointment_number": 1001,
    "priority": 1,
    "medocCardUrl": "url"
  },
  "billingDetails": {
    "billingId": "bill_78G6H5",
    "totalAmount": 500.0,
    "paymentMethod": "Cash",  // Options: Cash, Cashless, Insurance
    "insuranceDetails": {
      "insuranceProvider": "provider_name",
      "insurancePolicyNumber": "policy_123456",
      "coverageAmount": 300.0,
      "insuranceClaimStatus": "Pending" // Options: Approved, Rejected, Pending
    },
    "discount": {
      "discountType": "percentage", // Options: flat, percentage
      "discountValue": 10.0,
      "discountReason": "Senior Citizen"
    },
    "finalAmount": 450.0,
    "paymentStatus": "Paid",  // Options: Paid, Unpaid, Pending
    "billingDate": "2021-10-10T10:30:00Z",
    "notes": "Patient opted for cash payment with senior citizen discount applied."
  }
}

labscan json data
{
  "hospitalId":"hos_7BA7CF",
  "patientUsername": "pat_12BA23",
  "patientName": "John Doe",
  "date": "2021-10-10",
  "hospitalName": "Hospital",
  "DOB": "1990-10-10",
  "type": "Lab Scan",
  "prescipDoctor": "doc_45CD59",
  "performingDoc": "doc_45CD59",
  "note": "note",
  "contents": [
    {
      "test_name": "test1",
      "result_value": "value1",
      "unit": "unit1",
      "ref_range": "range1"
    },
    {
      "test_name": "test2",
      "result_value": "value2",
      "unit": "unit2",
      "ref_range": "range2"
    }
  ],
  "file_path": "path",
  "uploaded_by": "doc_45CD59",
  "uploaded_At": "2021-10-10",
  "downloaded_by": ["doc_45CD59"],
  "downloaded_at": ["2021-10-10"],
  "createdAt": "2021-10-10",
  "updatedAt": "2021-10-10",
  "department": "department"
}

*/