import { IRateType } from "../../../ipd/ipdModel";

export interface IIpdBillingDetail {
  hospitalId: string;
  billId: string;
  billingDate_time: string;
  billing: ipddetail;
  finalAmount: number;
  partPayment:{
    paidAmount: number;
    remainingAmount: number;
  }
  ipdId: string; //mongoId of ipd
}
//roomcharges, consultationcharges, services, medicines, procedures, subtotal, taxes, totalBill, paymentMethod, insuranceCoverage, patientPayable
export interface ipddetail {
  roomCharges: roomCharges;
  consultationCharges: consultationCharges;
  services: services[];
  medicines: medicines[];
  procedures: procedures[];
  testBills: testBills[];
  taxes: taxes;
  paymentMethod: string;
  insuranceCoverage: insuranceCoverage;
  paymentStatus: string;
  Rate_Type: IRateType
}

export interface testBills {
  testId: string;
  amount: number;
}
export interface roomCharges {
  type: roomType;
  dailyRate: number;
  days: number;
}
export interface consultationCharges {
  visits: number;
  ratePerVisit: number;
}
export interface services {
  serviceId: string;
  name: string;
  rate: number;
  quantity: number;
}
export interface medicines {
  medicineId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}
export interface procedures {
  procedureId: string;
  name: string;
  charge: number;
}
export interface taxes {
  gst: number;
  otherTaxes: number;
}
export interface insuranceCoverage {
  provider: string;
  policyNumber: string;
  coverageAmount: number;
}

export enum roomType {
  PRIVATE = "Private",
  SEMIPRIVATE = "Semi Private",
  DELUXESUITE = "Deluxe Suite",
}

export interface bedCharges {
  
}
/* 
{"General": 1500, 
"Emergency": 1500, 
"ICU": 5400, 
"Private": 4500, 
"Other": 3000, 
"Surgical": 5400}
*/
/*
{
  "billId": "B7891011",
  "billingDate_time": "2024-09-07T14:30:00Z",
  "billing": {
    "roomCharges": {
      "type": "Private",
      "dailyRate": 200,
      "days": 5
    },
    "consultationCharges": {
      "visits": 3,
      "ratePerVisit": 50
    },
    "services": [],
    "medicines": [],
    "procedures": [],
    "taxes": {
      "gst": 100,
      "otherTaxes": 50
    },
    "insuranceCoverage": {
      "provider": "HealthInsure",
      "policyNumber": "POL123456789",
      "coverageAmount": 1000
    }  
  }
  
}

[
  {
    "name": "X-ray",
    "rate": 150,
    "quantity": 2
  },
  {
    "name": "Ultrasound",
    "rate": 100,
    "quantity": 1
  }
]

[
  {
    "name": "Appendectomy",
    "charge": 1500
  },
  {
    "name": "Gallbladder Removal",
    "charge": 1200
  }
]

[
  {
    "medicineId": "M001",
    "name": "Paracetamol",
    "unitPrice": 10,
    "quantity": 20
  },
  {
    "medicineId": "M002",
    "name": "Ibuprofen",
    "unitPrice": 15,
    "quantity": 10
  }
]

*/


