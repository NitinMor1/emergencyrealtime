import { Request, Response } from "express";
import { getCollection, mongoErrorHandler } from "../../db/db";
import { IPrescription } from "./prescriptionModel";

export const getPrescription = async (req: Request, res: Response) => {
    try {
        const { patientUsername, hospitalId } = req.query;
        if (!patientUsername) {
            return res.status(400).json({
                success: false,
                message: "Patient username is required"
            });
        }
        
        const query = hospitalId ? 
            { patientUsername: patientUsername, hospitalId: hospitalId } : 
            { patientUsername: patientUsername };
            
        const presColl = await getCollection<IPrescription>("Prescriptions", null);
        const prescriptions = await presColl.find(query).toArray();
        
        return res.status(200).json({ 
            success: true,
            message: "Prescriptions fetched successfully",
            data: prescriptions
        });
    } catch (error) {
        mongoErrorHandler(error, "Error in prescription get handled", "Error in prescription get");
        return res.status(500).json({ 
            success: false,
            message: "Internal Server Error" 
        });
    }
};

