export interface IDoctor {
  hospitalId: string;
  doctorName: string;
  doctorUsername: string | undefined;
  email: string;
  password: string;
  phoneNumber: string;
  mode: IModes;
  specialization: string;
  address: string;
  listOfHospitals: string[];
  department: EDepartment;
  about?: string;
  toggle?: boolean | string;
  subOrdinates?: string[];
  supervisors?: string[];
  signature?: string;
  profilePicture?: {
    id: string;
    url: string;
  }
  DutySchedule?: IDutySchedule;
}

export enum IModes {
  PARTTIME = "part-time",
  FULLTIME = "full-time",
}

export enum EDepartment {
  CARDIOLOGY = "Cardiology",
  NEUROLOGY = "Neurology",
  GYNECOLOGY = "Gynecology",
  ORTHOPEDICS = "Orthopedics",
  PEDIATRICS = "Pediatrics",
  PSYCHIATRY = "Psychiatry",
  RADIOLOGY = "Radiology",
  UROLOGY = "Urology",
  PULMONOLOGY = "Pulmonology",
  OTHER = "Other"
}

export interface ITimeSlot {
  dutyId: string;
  slots: {
    slotId: string;
    slotTime: string[];
    startTime: string;
    endTime: string
    eventType: EEventType;
    hospitalId: string;
  }[];
}

export enum EEventType {
  OPD = "OPDTime",
  IPD = "IPDVisitTime",
  OT = "OTTime",
  OFFICE = "Office"
}

export type IDutySchedule = {
  [key in EDay]?: ITimeSlot;
};

export enum EDay {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday"
}



