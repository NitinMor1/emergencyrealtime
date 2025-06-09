import { z } from 'zod';
import { ITEMTYPE, SUBTYPE } from './inventoryModel';

// Enums
export const ItemTypeEnum = z.nativeEnum(ITEMTYPE);
export const SubTypeEnum = z.nativeEnum(SUBTYPE);

// Item Create Schema
export const ItemSchema = z.object({
    hospitalId: z.string(),                 // string
    vendorName: z.string(),                // string
    vendorId: z.string(),                  // string
    itemType: ItemTypeEnum.optional(),               // enum
    name: z.string(),                      // string
    expiry: z.string().nullable().optional(),  // string | null | undefined
    batchNo: z.string(),                   // string
    hsnNo: z.string(),                     // string
    packing: z.string(),                   // string
    subType: SubTypeEnum,                 // enum
    quantity: z.number(),                 // number
    price: z.number()                     // number
});

// Item Update Schema (all fields optional)
export const ItemUpdateSchema = ItemSchema.partial();

// Query Schema for filtering/search
export const ItemQuerySchema = z.object({
    hospitalId: z.string(),                    // string
    id: z.string().optional(),                 // string | undefined
    itemType: ItemTypeEnum.optional(),        // enum | undefined
    subType: SubTypeEnum.optional(),          // enum | undefined
    page: z.string().optional(),              // string | undefined
    limit: z.string().optional(),             // string | undefined
    lowerLimit: z.number().optional(),        // number | undefined
    upperLimit: z.number().optional(),        // number | undefined
});

// Type inference
export type IItemSchema = z.infer<typeof ItemSchema>;
