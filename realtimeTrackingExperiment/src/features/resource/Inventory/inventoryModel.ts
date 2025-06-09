// export interface IItem {
//   hospitalId: string;
//   vendorName: string;
//   vendorId: string;
//   itemType: ITEMTYPE;
//   name: string;
//   expiry: string | null;
//   batchNo: string;
//   hsnNo: string;
//   packing: string; // like 30ml bottle or 60 ml bottle or for powders like 500g pack and 250g package
//   subType: SUBTYPE;
//   quantity: number;
//   price: number;
// }

// export enum SUBTYPE {
//   INJECTION = "injection",
//   CAPSULE = "capsule",
//   TABLET = "tablet",
//   SYRUP = "syrup",
//   INTERNAL = "internal",
//   EXTERNAL = "external",
// }

// export enum ITEMTYPE {
//   MEDICINE = "medicine",
//   DEVICE = "device",
//   MISCELLANEOUS = "miscellaneous",
// }

/*
create a json body to insert into database
{
  "hospitalId": "hos_7BA7CF",
  "vendorName": "vendor1",
  "vendorId": "ven_123",
  "itemType": "medicine",
  "name": "paracetamol",
  "expiry": "2022-12-12",
  "batchNo": "123",
  "hsnNo": "123",
  "packing": "30ml",
  "subType": "tablet",
  "quantity": 100,
  "price": 10
}
*/

// import {z} from 'zod';
import { IItemSchema } from './inventoryValidation';
export type IItem = IItemSchema;

export enum SUBTYPE{
  INJECTION = "injection",
  CAPSULE = "capsule",
  TABLET = "tablet",
  SYRUP = "syrup",
  INTERNAL = "internal",
  EXTERNAL = "external",
}

export enum ITEMTYPE{
  MEDICINE = "medicine",
  DEVICE = "device",
  MISCELLANEOUS = "miscellaneous",
}
