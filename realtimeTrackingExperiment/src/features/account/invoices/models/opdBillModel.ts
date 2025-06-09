export interface IBillingDetails {
  hospitalId: string;
  transactionId: string | "";
  billingId: string;
  totalAmount: number;
  paymentMethod: paymentMethod;
  insuranceDetails?: IInsuranceDetails;
  discount?: IDiscount;
  finalAmount: number;
  billingDate_time: string;
  notes: string | "";
  appointmentId: string;
}
export interface IInsuranceDetails { // don't touch this interface
  insuranceProvider: string | "";
  insurancePolicyNumber: string | "";
  coverageAmount: number | "";
  insuranceClaimStatus: string | "";
}
export interface IDiscount {
  discountType: string | "";
  discountValue: number | "";
  discountReason: string | "";
}
export enum paymentMethod {
  CASH = "Cash",
  CARD = "Card",
  ONLINE = "Online",
  UPI = "UPI",
  OTHER = "Other",
}
