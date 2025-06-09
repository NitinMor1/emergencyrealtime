import { IStatus } from "../account/invoices/models/invoicesModel";

export interface IIncome {
  hospitalId: string;
  name: string;
  description: string;
  finalAmount: number;
}

export enum IType {
  ASSET = "asset",
  LIABILITY = "liability",
}

export interface IExpense {
  hospitalId: string;
  type: IType;
  name: string;
  description: string;
  amount: number;
  status: IStatus;
}

export interface IFinance {
  hospitalId: string;
  amountPending: number;
  outgoingAmount: number;
  income: number;
  totalNumberOfBills?:{
    ipdBills?: number;
    ipdTotalAmount?: number;
    opdBills?: number;
    opdTotalAmount?: number;
    testBills?: number;
    testTotalAmount?: number;
},
  netProfit?:number;
  burnRate?:number;
}

/*

dummy data to add liability 
{
  "hospitalId": "hos_1A3D31",
  "name": "Liability 1",
  "description": "Liability 1",
  "amount": 1000,
  "status": "pending"
}

dummy data to add asset
{
  "hospitalId": "hos_1A3D31",
  "name": "Asset 1",
  "description": "Asset 1",
  "amount": 1000,
  "status": "pending"
}

*/
