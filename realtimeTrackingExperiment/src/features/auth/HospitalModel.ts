export interface IHospital {
    hospitalId: string;
    hospitalType: EhospitalType;
    name: string;
    phoneNumber: string;
    email: string;
    address: string;
    password: IPassword;
    ambulance: string[]; // ambulance schema
    // ambulance: Iambulance[];
    labs: Ilabs[];
    room: IRoom[];
    depts: EDepartment[]; // departments schema
    passkeys: IPasskey[];
    roleAccess: string[];
    ratePerBill?: {
        ratePerOpdBill:number;
        ratePerIpdBill:number;
        ratePerTestBill:number;
        // ratePerSurgeryBill:number;
    };
    wallet?:number | 0;
    location?:{
        latitude: number; // 22.1234
        longitude: number; // 78.1234
        accuracy: number; // 10.0
    },
    loginDistance?: number; 
    Images?:{
        hospitalLogo: string; // hospital logo
        headerImage: string; // header image
        footerImage: string; // footer image
    }
    uhidNumber? : number;
    spacings?:{
        A4:ISpacing;
        DL:ISpacing;
    }
    colors?:{
        primaryColor: string; // hex color code
        secondaryColor: string; // hex color code
        accentColor: string; // hex color code
        backgroundColor: string; // hex color code
    }
    appointmentPerSlot?: number;
    discount:{
    opdDiscount:{
        VisitCount: number; 
        Discount: number;
        freeOpdInterval: number // in days
    },
    }
        }
        export interface Ilabs{
            LabId: string;
            LabName: string;
            LabType: string; // e.g. Radiology, Pathology
            LabPrice: number; // price for the lab test
            LabDescription: string; // description of the lab
            LabImage: string; // image of the lab
            LabContact: {
                name:string;
                phoneNumber: string; // phone number of the lab
                email: string; // email of the lab
                address: string; // address of the lab
            };
        }

export interface ISpacing {
  headerSpacing: number;
  footerSpacing: number;
  leftSpacing: number;
  rightSpacing: number;
}

export interface IDoctor {
  hospitalId: string;
  doctorName: string;
  doctorUsername?: string;
  email: string;
  password: string;
  phoneNumber: string;
  mode: IModes;
  specialization: string;
  profileUrl: string;
  address: string;
  listOfHospitals: string[];
  department: EDepartment;
  about?: string;
  toggle?: boolean | string;
  subOrdinates?: string[];
  supervisors?: string[];
}

export enum IModes {
  PARTTIME = "part-time",
  FULLTIME = "full-time",
}

export interface IPasskey {
  empId: string;
  role?: string;
  expiresAt: string;
  key: string;
  priority?: number;
  authorized?: {
    empId: string;
    role: string;
    subPasskey?: string;
    key?: string;
  }[];
}

export interface IPassword {
  password: string;
  expiresAt: string;
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
  OTHER = "Other",
}

export interface Iid_number {
  id: string;
  number: number;
}

export interface IRoom {
  type: roomType | string;
  totalNumberOfRooms: number;
  room: Room[];
  price: number;
  totalNumberOfBeds: number;
  totalNumberOfBedsAvailable: number;
  totalNumberOfBedsUnavailable: number;
}

export interface Room {
  roomNumber: number;
  beds: number;
  bedAvailable: number;
  bedUnavailable: number;
}

export enum roomType {
  EMERGENCY = "Emergency",
  GENERAL = "General",
  PRIVATE = "Private",
  ICU = "ICU",
  SURGICAL = "Surgical",
}

export enum EhospitalType {
  NURSINGHOME = "Nursing Home",
  HOSPITAL = "Hospital",
  CLINIC = "Clinic",
  CTSCAN = "CT Scan",
  OTHER = "Other",
}

export interface IRoleAccess {
  paramedics: string[];
  ipd: string[];
  opd: string[];
  surgery: string[];
  emergency: string[];
  labsAndScans: string[];
  inventory: string[];
  accounts: string[];
  equipment: string[];
  finance: string[];
  staff: string[];
  dashboard: string[];
}

export interface Ilabs {
  LabId: string;
  LabName: string;
  LabType: string;
  LabPrice: number;
  LabDescription: string;
  LabImage: string;
  LabContact: {
    name: string;
    phoneNumber: string;
    email: string;
    address: string;
  };
}

export interface IRefreshToken {
  hospitalId: string;
  passkey: string;
  tokens: string[];
}