import { IAlert, alertStatus } from "./emergencyAlertSchema";
import { getCollection } from "../../../db/db";
import { Request, Response } from "express";
import { ObjectId } from 'mongodb';

export const createAlert = async (req: Request, res: Response) => {
    try {
        const {
            hospitalId,
            doctorUsername,
            message,
            status,
            date,
            createdBy
        } = req.body;
        const alertColl = await getCollection<IAlert>("Alerts", hospitalId?.toString());
        if (!hospitalId || !doctorUsername || !message || !status) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }
        const alert: IAlert = {
            hospitalId: hospitalId,
            doctorUsername: doctorUsername ?? "",
            message: message ?? "",
            status: status as alertStatus ?? alertStatus.MEDIUM,
            date: date ?? "",
            createdBy: createdBy ?? " "
        };
        const result = await alertColl.insertOne(alert);
        return res.status(200).json({
            success: true,
            message: "Alert created successfully",
            data: result
        });
    } catch (error: any) {
        console.error("Error in creating alert", error);
        return res.status(500).json({
            success: false,
            message: "Error in creating alert"
        });
    }
};

export const getAlerts = async (req: Request, res: Response) => {
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
        const alertColl = await getCollection<IAlert>("Alerts", hospitalId?.toString());
        const alerts: IAlert[] = await alertColl.find().skip(lowerLimit).limit(limit).toArray();
        if (!alerts) {
            return res.status(404).json({
                success: true,
                message: "No alerts found."
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "Alerts fetched successfully.",
                data: alerts
            });
        }
    } catch (error: any) {
        console.error("Error in fetching alerts", error);
        return res.status(500).json({
            success: false,
            message: "Error in fetching alerts"
        });
    }
}

export const updateAlert = async (req: Request, res: Response) => {
    try {
        const { hospitalId, id } = req.query;
        const mongoId = new ObjectId(id as string);
        const data = req.body;
        const alertColl = await getCollection<IAlert>("Alerts", hospitalId?.toString());
        const result = await alertColl.findOneAndUpdate(
            { _id: mongoId },
            { $set: data },
            { returnDocument: "after" }
        );
        if (!result) {
            return res.status(404).json({
                success: true,
                message: "Alert not found."
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "Alert updated successfully.",
                data: result
            });
        }
    } catch (error: any) {
        console.error("Error in updating alert", error);
        return res.status(500).json({
            success: false,
            message: "Error in updating alert"
        });
    }
}

export const deleteAlert = async (req: Request, res: Response) => {
    try {
        const { hospitalId, id } = req.query;
        const mongoId = new ObjectId(id as string);
        const alertColl = await getCollection<IAlert>("Alerts", hospitalId?.toString());
        const result = await alertColl.findOneAndDelete({ _id: mongoId });
        if (!result) {
            return res.status(404).json({
                success: true,
                message: "Alert not found."
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "Alert deleted successfully.",
                data: result
            });
        }
    } catch (error: any) {
        console.error("Error in deleting alert", error);
        return res.status(500).json({
            success: false,
            message: "Error in deleting alert"
        });
    }
}