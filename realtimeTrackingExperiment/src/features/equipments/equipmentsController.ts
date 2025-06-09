
import { Request, Response } from "express";
import { getCollection } from "../../db/db";
import { IEquipment } from "./equipmentModel";
import { ObjectId } from "mongodb";
import { ITEMTYPE } from "../resource/Inventory/inventoryModel";


export const addEquipments = async (req: Request, res: Response) => {
    try {
        const {
            hospitalId,
            itemId,
            name,
            type,
            roomId,
            issuedOn,
            returnedOn,
            issuedFrom,
            issuedTo,
            quantity
        } = req.body;
        const equipmentcoll = await getCollection<IEquipment>(
            "EquipmentList",
            hospitalId?.toString()
        );
        const equipment: IEquipment = {
            hospitalId,
            itemId: itemId,
            name: name,
            type: type as ITEMTYPE,
            roomId: roomId,
            issuedOn: issuedOn?.toString(),
            returnedOn: returnedOn?.toString(),
            issuedTo: issuedTo,
            issuedFrom: issuedFrom || "",
            quantity: quantity
        }
        const result = await equipmentcoll.insertOne(equipment);
        return res.status(201).json({
            success: true,
            message: "Equipment added successfully.",
            data: equipment
        })
    } catch (error: any) {
        console.error("Error in adding equipments", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const getEquipments = async (req: Request, res: Response) => {
    try {
        const { hospitalId } = req.query;
        const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
        const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
        const limit = upperLimit - lowerLimit; // Calculate the limit for the query

        if (limit <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid range: upperLimit must be greater than lowerLimit"
            });
        }
        const equipmentcoll = await getCollection<IEquipment>(
            "EquipmentList",
            hospitalId?.toString()
        );
        const equipments: IEquipment[] = await equipmentcoll.find().skip(lowerLimit).limit(limit).toArray();
        if (!equipments) {
            return res.status(404).json({
                success: true,
                message: "Equipments not found."
            })
        } else {
            return res.status(200).json({
                success: true,
                message: "Equipments fetched successfully.",
                data: equipments
            })
        }
    } catch (error: any) {
        console.error("Error in getting equipments", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

// jab item surgery se return ho jaye tb iska returned ON update krdo
export const updateEquipments = async (req: Request, res: Response) => {
    try {
        const { hospitalId, id } = req.query;
        const mongoId = new ObjectId(id as string);
        const equipments = req.body;
        const equipmentcoll = await getCollection<IEquipment>(
            "EquipmentList",
            hospitalId?.toString()
        );
        const updatedEquipment = await equipmentcoll.findOneAndUpdate({ _id: mongoId }, { $set: equipments }, { returnDocument: "after" });
        if (updatedEquipment) {
            return res.status(201).json({
                success: true,
                message: "Equipment updated successfully.",
                data: updatedEquipment
            })
        } else {
            return res.status(404).json({
                success: true,
                message: "Equipment not found."
            })
        }
    } catch (error: any) {
        console.error("Error in updating equipments", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const deleteEquipment = async (req: Request, res: Response) => {
    try {
        const { hospitalId, id } = req.query;
        const mongoId = new ObjectId(id as string);
        const equipmentcoll = await getCollection<IEquipment>(
            "EquipmentList",
            hospitalId?.toString()
        );
        const equipment = await equipmentcoll.findOneAndDelete({ _id: mongoId });
        if (equipment) {
            return res.status(201).json({
                success: true,
                message: "Equipment deleted successfully.",
                data: equipment
            })
        }
        else {
            return res.status(404).json({
                success: true,
                message: "Equipment not found."
            })
        }
    } catch (error: any) {
        console.error("Error in deleting equipments", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}