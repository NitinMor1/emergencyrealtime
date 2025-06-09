// import { Request, Response } from "express";
// import { IItem, ITEMTYPE } from "./inventoryModel"; // Assuming IItem is the interface for your Item model
// import { ItemSchema,ItemUpdateSchema,ItemQuerySchema } from "./inventoryValidation";
// import { getCollection } from "../../../db/db"; // this is coming from mongoDb connection
// import { ObjectId } from 'mongodb';

// // get all Items
// export const getAllItems = async (req: Request, res: Response) => {
//   try {
//     /* bucket approach is need to be added (hospital_id) */
//     const { hospitalId } = req.query;
//     const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
//     const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
//     const limit = upperLimit - lowerLimit; // Calculate the limit for the query

//     if (limit <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid range: upperLimit must be greater than lowerLimit"
//       });
//     }
//     const itemColl = await getCollection<IItem>("Item", hospitalId?.toString());
//     const items: IItem[] = await itemColl.find().skip(lowerLimit).limit(limit).toArray();
//     if (items.length == 0) {
//       return res.status(404).json({
//         success: true,
//         message: "No item found.",
//       });
//     } else {
//       return res.status(200).json({
//         success: true,
//         message: "Item fetched successfully.",
//         data: items,
//       });
//     }
//   } catch (error: any) {
//     console.error("Error in getting item", error)
//     return res.status(500).json({
//       success: false,
//       message: "Error in fetching the item",
//     });
//   }
// };


// // create a new Item
// export const createItem = async (req: Request, res: Response) => {
//   try {
//     // const { hospitalId } = req.query;

//     //Validate request body against schema
//     const validatedData = ItemSchema.parse(req.body);

//     const result = await itemCollection.insertOne(validatedData);
//     const {
//       hospitalId,
//       vendorName,
//       vendorId,
//       itemType,
//       name,
//       expiry,
//       subType,
//       quantity,
//       price,
//       batchNo,
//       packing,
//       hsnNo,
//     } = req.body;
//     const itemColl = await getCollection<IItem>(
//       "Item", hospitalId?.toString()
//     );
//     if (!hospitalId || !itemType || !name || !subType || !quantity || !price) {
//       return res.status(404).json({
//         success: false,
//         message: "All fields are required.",
//       });
//     }

//     if (itemType === "medicine" && !expiry) {
//       return res.status(400).json({
//         success: false,
//         message: "Expiry is required for medicine.",
//       });
//     }

//     if (itemType === "medicine" && subType !== "injection" && subType !== "capsule" && subType !== "tablet" && subType !== "syrup") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid subType for medicine.",
//       });
//     }

//     if (itemType === "device" && subType !== "internal" && subType !== "external") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid subType for device.",
//       });
//     }

//     const newItem: IItem = {
//       hospitalId: hospitalId?.toString() || "",
//       vendorName,
//       vendorId,
//       itemType,
//       name,
//       expiry,
//       subType,
//       quantity,
//       price,
//       batchNo,
//       hsnNo,
//       packing,
//     };

//     const insertResult = await itemColl.insertOne(newItem);
//     return res.status(201).json({
//       success: true,
//       message: "Item created successfully.",
//       data: insertResult,
//     });

//   } catch (error: any) {
//     console.error("Error in creating item", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error in creating a item",
//     });
//   }
// };

// // update a Item 
// export const updateItem = async (req: Request, res: Response) => {
//   try {
//     const { hospitalId, id } = req.query;
//     const mongoId = new ObjectId(id as string);
//     const updatedItem = req.body;

//     if (Object.keys(updatedItem).length == 0) {
//       return res.status(400).json({
//         success: true,
//         message: "atleast one field is required to update",

//       })
//     }
//     const itemColl = await getCollection<IItem>(
//       "Item",
//       hospitalId?.toString()
//     );
//     const updateResult = await itemColl.findOneAndUpdate(
//       { _id: mongoId },
//       { $set: updatedItem },
//       { returnDocument: "after" }
//     );
//     console.log('update result', updateResult);
//     if (updateResult) {
//       return res.status(201).json({
//         success: true,
//         message: "Item updated successfully",
//         data: updateResult,
//       });
//     } else {
//       return res.status(404).json({
//         success: true,
//         message: "Item not found",
//       });
//     }
//   } catch (error) {
//     console.error("Error in updating item", error)
//     return res.status(500).json({
//       success: false,
//       message: "Error in updating the item",
//     });
//   }
// };

// // delete a Item
// export const deleteItem = async (req: Request, res: Response) => {
//   try {
//     const { hospitalId, id } = req.query;
//     const mongoId = new ObjectId(id as string);

//     const itemColl = await getCollection<IItem>(
//       "Item",
//       hospitalId?.toString()
//     );
//     const deleteResult = await itemColl.findOneAndDelete({ _id: mongoId });
//     if (!deleteResult) {
//       return res.status(404).json({
//         success: true,
//         message: "Item not found.",
//       });
//     } else {
//       return res.status(201).json({
//         success: true,
//         message: "Item deleted successfully",
//         data: deleteResult,
//       })
//     }
//   } catch (error) {
//     console.error("Error in deleting item", error)
//     return res.status(500).json({
//       success: false,
//       message: "Error in deleting the item",
//     });
//   }
// };

// // get a Item by id
// export const getItemById = async (req: Request, res: Response) => {
//   try {
//     const { hospitalId, id } = req.query;
//     const itemColl = await getCollection<IItem>("Item", hospitalId?.toString());
//     console.log("works")
//     const mongoId = new ObjectId(id as string);
//     const item = await itemColl.findOne({ _id: mongoId });
//     if (!item) {
//       return res.status(404).json({
//         success: true,
//         message: "Item not found.",
//       });
//     } else {
//       return res.status(200).json({
//         success: true,
//         message: "Item fetched successfully.",
//         data: item,
//       });
//     }
//   } catch (error: any) {
//     return res.status(500).json({
//       success: false,
//       message: "Error in fetching a item",
//     });
//   }
// };

// //get all the medicine
// export const getAllMedicine = async (req: Request, res: Response) => {
//   try {
//     const { hospitalId } = req.query;
//     const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
//     const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
//     const limit = upperLimit - lowerLimit; // Calculate the limit for the query

//     if (limit <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid range: upperLimit must be greater than lowerLimit"
//       });
//     }
//     const itemColl = await getCollection<IItem>("Item", hospitalId?.toString());
//     const medicines: IItem[] = await itemColl.find({ itemType: ITEMTYPE.MEDICINE }).skip(lowerLimit).limit(limit).toArray();
//     if (medicines.length == 0) {
//       return res.status(404).json({
//         success: true,
//         message: "No medicine found.",
//       });
//     } else {
//       return res.status(200).json({
//         success: true,
//         message: "Medicine fetched successfully.",
//         data: medicines,
//       });
//     }
//   } catch (error: any) {
//     return res.status(500).json({
//       success: false,
//       message: "Error in fetching a medicine",
//     });
//   }
// };

// //get all devices
// export const getAllDevice = async (req: Request, res: Response) => {
//   try {
//     const { hospitalId } = req.query;
//     const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
//     const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
//     const limit = upperLimit - lowerLimit; // Calculate the limit for the query

//     if (limit <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid range: upperLimit must be greater than lowerLimit"
//       });
//     }
//     const itemColl = await getCollection<IItem>("Item", hospitalId?.toString());
//     const devices: IItem[] = await itemColl.find({ itemType: ITEMTYPE.DEVICE }).skip(lowerLimit).limit(limit).toArray();
//     if (!devices) {
//       return res.status(404).json({
//         success: true,
//         message: "No device found.",
//       });
//     } else {
//       return res.status(200).json({
//         success: true,
//         message: "Device fetched successfully.",
//         data: devices,
//       });
//     }
//   } catch (e) {
//     return res.status(500).json({
//       success: false,
//       message: "Error in fetching the device",
//     });
//   }
// };

import { Request, Response } from "express";
import { IItem, ITEMTYPE } from "./inventoryModel";
import { ItemSchema, ItemUpdateSchema, ItemQuerySchema } from "./inventoryValidation";
import { getCollection } from "../../../db/db";
import { ObjectId } from 'mongodb';
import { z } from 'zod';

// Validation helper
const validatePagination = (lowerLimit: number, upperLimit: number) => {
  if (upperLimit <= lowerLimit) {
    throw new Error("Invalid range: upperLimit must be greater than lowerLimit");
  }
  return { limit: upperLimit - lowerLimit, skip: lowerLimit };
};

// get all Items
export const getAllItems = async (req: Request, res: Response) => {
  try {
    const queryValidation = ItemQuerySchema.parse(req.query);
    const { hospitalId, lowerLimit = 0, upperLimit = 1000 } = queryValidation;

    const { limit, skip } = validatePagination(Number(lowerLimit), Number(upperLimit));
    
    const itemColl = await getCollection<IItem>("Item", hospitalId);
    const items = await itemColl.find()
      .skip(skip)
      .limit(limit)
      .toArray();

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No items found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Items fetched successfully",
      data: items
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors
      });
    }
    
    console.error("Error in getting items:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching items"
    });
  }
};

// create a new Item
export const createItem = async (req: Request, res: Response) => {
  try {
    // Validate the entire request body
    const validationResult = ItemSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }

    const validatedData = validationResult.data;
    const itemColl = await getCollection<IItem>("Item", validatedData.hospitalId);

    // Additional business logic validation
    if (validatedData.itemType === ITEMTYPE.MEDICINE && !validatedData.expiry) {
      return res.status(400).json({
        success: false,
        message: "Expiry date is required for medicines"
      });
    }

    // Insert the validated data
    const insertResult = await itemColl.insertOne(validatedData);

    return res.status(201).json({
      success: true,
      message: "Item created successfully",
      data: {
        _id: insertResult.insertedId,
        ...validatedData
      }
    });

  } catch (error) {
    console.error("Error creating item:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating item",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
// update an Item
export const updateItem = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = ItemQuerySchema.pick({ hospitalId: true, id: true }).parse(req.query);
    const updateData = ItemUpdateSchema.parse(req.body);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update data provided"
      });
    }

    const mongoId = new ObjectId(id as string);
    const itemColl = await getCollection<IItem>("Item", hospitalId);

    const updateResult = await itemColl.findOneAndUpdate(
      { _id: mongoId },
      { $set: { ...updateData, updatedAt: new Date().toISOString() } },
      { returnDocument: "after" }
    );

    if (!updateResult) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Item updated successfully",
      data: updateResult
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors
      });
    }

    console.error("Error updating item:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating item"
    });
  }
};

// delete an Item
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = ItemQuerySchema.pick({ hospitalId: true, id: true }).parse(req.query);
    const mongoId = new ObjectId(id as string);
    
    const itemColl = await getCollection<IItem>("Item", hospitalId);
    const deleteResult = await itemColl.findOneAndDelete({ _id: mongoId });

    if (!deleteResult) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Item deleted successfully",
      data: deleteResult
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors
      });
    }

    console.error("Error deleting item:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting item"
    });
  }
};

// get an Item by id
export const getItemById = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = ItemQuerySchema.pick({ hospitalId: true, id: true }).parse(req.query);
    const mongoId = new ObjectId(id as string);
    
    const itemColl = await getCollection<IItem>("Item", hospitalId);
    const item = await itemColl.findOne({ _id: mongoId });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Item fetched successfully",
      data: item
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors
      });
    }

    console.error("Error fetching item:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching item"
    });
  }
};

// get all medicines
export const getAllMedicine = async (req: Request, res: Response) => {
  try {
    const queryValidation = ItemQuerySchema.parse(req.query);
    const { hospitalId, lowerLimit = 0, upperLimit = 1000 } = queryValidation;

    const { limit, skip } = validatePagination(Number(lowerLimit), Number(upperLimit));
    
    const itemColl = await getCollection<IItem>("Item", hospitalId);
    const medicines = await itemColl.find({ itemType: ITEMTYPE.MEDICINE })
      .skip(skip)
      .limit(limit)
      .toArray();

    if (medicines.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No medicines found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Medicines fetched successfully",
      data: medicines
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors
      });
    }

    console.error("Error fetching medicines:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching medicines"
    });
  }
};

// get all devices
export const getAllDevice = async (req: Request, res: Response) => {
  try {
    const queryValidation = ItemQuerySchema.parse(req.query);
    const { hospitalId, lowerLimit = 0, upperLimit = 1000 } = queryValidation;

    const { limit, skip } = validatePagination(Number(lowerLimit), Number(upperLimit));
    
    const itemColl = await getCollection<IItem>("Item", hospitalId);
    const devices = await itemColl.find({ itemType: ITEMTYPE.DEVICE })
      .skip(skip)
      .limit(limit)
      .toArray();

    if (devices.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No devices found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Devices fetched successfully",
      data: devices
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors
      });
    }

    console.error("Error fetching devices:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching devices"
    });
  }
};