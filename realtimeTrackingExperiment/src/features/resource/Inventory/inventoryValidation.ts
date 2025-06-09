import {z} from 'zod';
import { ITEMTYPE,SUBTYPE } from './inventoryModel';

const ItemTypeEnum = z.nativeEnum(ITEMTYPE);
const SubTypeEnum = z.nativeEnum(SUBTYPE);

export const ItemSchema = z.object({
  hospitalId: z.string({
    required_error: "Hospital ID is required"
  }),
  vendorName: z.string({
    required_error: "Vendor name is required"
  }).min(1, "Vendor name cannot be empty")
    .regex(/^[a-zA-Z0-9\s]{3,50}$/, "Vendor name must be 3-50 characters long"),
  vendorId: z.string({
    required_error: "Vendor ID is required"
  }).min(1, "Vendor ID cannot be empty")
    .regex(/^ven_[a-zA-Z0-9]{3,}$/, "Vendor ID must start with 'ven_' followed by at least 3 characters"),
  itemType: z.nativeEnum(ITEMTYPE, {
    required_error: "Item type is required"
  }),
  name: z.string({
    required_error: "Item name is required"
  }).min(1, "Item name cannot be empty"),
  expiry: z.string().nullable().optional(),
  batchNo: z.string({
    required_error: "Batch number is required"
  }).min(1, "Batch number cannot be empty"),
  hsnNo: z.string({
    required_error: "HSN number is required"
  }).min(1, "HSN number cannot be empty"),
  packing: z.string({
    required_error: "Packing information is required"
  }).min(1, "Packing information cannot be empty"),
  subType: z.nativeEnum(SUBTYPE, {
    required_error: "Sub type is required"
  }),
  quantity: z.number({
    required_error: "Quantity is required"
  }).int().positive("Quantity must be positive"),
  price: z.number({
    required_error: "Price is required"
  }).positive("Price must be positive")
});

  export type IItemSchema = z.infer<typeof ItemSchema>;
  export const ItemUpdateSchema = ItemSchema.partial();

  export const ItemQuerySchema = z.object({
    hospitalId:z.string().min(1,"Hospital ID is required"),
    id: z.string().optional(),
    itemType:ItemTypeEnum.optional(),
    subType:SubTypeEnum.optional(),
    page:z.string().optional().transform((val)=>(val?parseInt(val):1)),
    limit:z.string().optional().transform((val)=>(val?parseInt(val):10)),
    lowerLimit: z.number().optional(),
    upperLimit: z.number().optional(),
  });