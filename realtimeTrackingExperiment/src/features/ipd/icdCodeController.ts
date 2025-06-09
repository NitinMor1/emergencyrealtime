import {Request, Response} from "express";
import { getCollection } from "../../db/db";
import { icdCodes } from "./icdCodesModel";

export const fetchIcdCodes = async (req: Request, res: Response) => {
    try {
        const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
        const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
        const limit = upperLimit - lowerLimit; // Calculate the limit for the query

        if (limit <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid range: upperLimit must be greater than lowerLimit"
            });
        }

        const idcCode = await getCollection<icdCodes>("icdCodes", null);
        const totalItems = await idcCode.countDocuments({}); // Get the total number of items
        const result = await idcCode.find({}).skip(lowerLimit).limit(limit).toArray();

        if (!result || result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No ICD codes found in the specified range"
            });
        }

        return res.status(200).json({
            success: true,
            data: result,
            pagination: {
                totalItems,
                currentRange: `${lowerLimit + 1} - ${lowerLimit + result.length}`,
                nextLowerLimit: lowerLimit + limit,
                nextUpperLimit: lowerLimit + limit * 2
            }
        });
    } catch (error: any) {
        console.error("Error in fetchIcdCodes", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};