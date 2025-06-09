import { Request, Response } from "express";
import { getCollection } from "../../../db/db";
import { IEmergency, EStatus } from "../emergencyModel";

export const pullEmergencyNotification = async (req: Request, res: Response) => {
    try {
        const { hospitalId } = req.query;

        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "Hospital ID is required"
            });
        }
        
        const emergencyCol = await getCollection<IEmergency>("Emergency", hospitalId as string);
        const emergencies = await emergencyCol.find({}).toArray();

        if (emergencies.length === 0) {
            return res.status(404).json({
                success: true,
                message: "No emergencies found",
            });
        }
        const findEmergencyCreatedByMEUser: IEmergency[] = emergencies.filter((emergency) => {
            return emergency.assigneeId === "MEUser" && 
                    emergency.isCompleted === false && 
                    emergency.creatorId === "" && 
                    emergency.driver === "";
        });

        if (findEmergencyCreatedByMEUser.length === 0) {
            return res.status(404).json({
                success: true,
                message: "No pending emergencies found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Emergency notifications fetched successfully",
            data: findEmergencyCreatedByMEUser,
        });
    } catch (error) {
        console.error("Error in emergency notification:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};