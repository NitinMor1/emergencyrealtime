import { ResultValidation } from "../testModel";
import { ObjectId } from "mongodb";
import { getCollection } from "../../../../db/db";
import {v4 as uuidv4} from 'uuid';
import { Request, Response } from "express";



export const startResultValidation = async (req: Request, res: Response) => {
    try{
        const{orderId,
            
            validationId,
            testId,
            validatorId, // empId
            validationType,
            validationCriteria,
            referenceMaterialsUsed,
            statisticalMethods,
            approvalStatus,
            comments,
            signature
        } = req.body;
        const {hospitalId} = req.query;
        if(!hospitalId || !validationId || !testId || !validatorId || !validationType || !validationCriteria || !approvalStatus){
            return res.status(400).json({message: "All fields are required",
                success: false
            });
        }
        const deconstructedData: ResultValidation = {
            orderId: orderId || "",
            validationId: validationId || `vald_${uuidv4().substring(0,6)}`+ new Date().getTime(),
            testId: testId,
            validatorId: validatorId, // emp mongoId
            validationType: validationType,
            validationCriteria: validationCriteria,
            referenceMaterialsUsed: referenceMaterialsUsed || [],
            statisticalMethods: statisticalMethods || [],
            approvalStatus: approvalStatus,
            comments: comments || "",
            signature: signature || ""
        }
        const resultValidationColl = await getCollection<ResultValidation>('resultValidation', hospitalId as string);
        const resultValidation = await resultValidationColl.findOne({validationId: validationId});
        if(resultValidation){
            await resultValidationColl.findOneAndUpdate({validationId}, {$set: deconstructedData});
            return res.status(201).json({
                message: "Already existing validationId, updated the existed resultValidation",
                success: true
            });
        }
        await resultValidationColl.insertOne(deconstructedData);
        return res.status(201).json({
            message: "ResultValidation initiated successfully",
            success: true
        })
    }catch(error:any){
        console.error("Error in startResultValidation: ", error);
        return res.status(500).json({message: "Internal Server Error",
            success:false
        });
    }
}


export const getResultValidation = async (req: Request, res: Response) => {
    try{
        const {hospitalId, id} = req.query;
        const resultValidationColl = await getCollection<ResultValidation>('resultValidation', hospitalId as string);
        const resultValidation = await resultValidationColl.findOne({_id: new ObjectId(id as string)});
        if(resultValidation){
            return res.status(200).json({
                message: "ResultValidation found",
                success: true,
                data: resultValidation
            });
        }
        return res.status(404).json({
            message: "ResultValidation not found",
            success: false
        });
    }catch(error:any){
        console.error("Error in getResultValidation: ", error);
        return res.status(500).json({message: "Internal Server Error",
            success:false
        });
    }
}

export const getAllResultValidation = async (req: Request, res: Response) => {
    try{
        const {hospitalId,orderId} = req.query;
        const resultValidationColl = await getCollection<ResultValidation>('resultValidation', hospitalId as string);
        const resultValidation = await resultValidationColl.find({
            orderId: orderId
        }).toArray();
        if(resultValidation){
            return res.status(200).json({
                message: "ResultValidation found",
                success: true,
                data: resultValidation
            });
        }
        return res.status(404).json({
            message: "ResultValidation not found",
            success: false
        });
    }catch(error:any){
        console.error("Error in getAllResultValidation: ", error);
        return res.status(500).json({message: "Internal Server Error",
            success:false
        });
    }
}

export const updateResultValidation = async (req: Request, res: Response) => {
    try{
        const {id} = req.query;
        const{orderId,
            hospitalId,
            validationId,
            testId,
            validatorId, // empId
            validationType,
            validationCriteria,
            referenceMaterialsUsed,
            statisticalMethods,
            approvalStatus,
            comments,
            signature
        } = req.body;
        if(!hospitalId || !validationId || !testId || !validatorId || !validationType || !validationCriteria || !approvalStatus){
            return res.status(400).json({message: "All fields are required",
                success: false
            });
        }
        const deconstructedData: ResultValidation = {
            orderId: orderId || "",
            validationId: validationId || `vald_${uuidv4().substring(0,6)}`+ new Date().getTime(),
            testId: testId,
            validatorId: validatorId, // emp mongoId
            validationType: validationType,
            validationCriteria: validationCriteria,
            referenceMaterialsUsed: referenceMaterialsUsed || [],
            statisticalMethods: statisticalMethods || [],
            approvalStatus: approvalStatus,
            comments: comments || "",
            signature: signature || ""
        }
        const resultValidationColl = await getCollection<ResultValidation>('resultValidation', hospitalId as string);
        const resultValidation = await resultValidationColl.findOne({_id: new ObjectId(id as string)});
        if(resultValidation){
            await resultValidationColl.findOneAndUpdate({_id: new ObjectId(id as string)}, {$set: deconstructedData});
            return res.status(201).json({
                message: "ResultValidation updated successfully",
                success: true
            });
        }
        return res.status(404).json({
            message: "ResultValidation not found",
            success: false
        });
    }catch(error:any){
        console.error("Error in updateResultValidation: ", error);
        return res.status(500).json({message: "Internal Server Error",
            success:false
        });
    }
}

export const deleteResultValidation = async (req: Request, res: Response) => {
    try{
        const {hospitalId, id} = req.query;
        const resultValidationColl = await getCollection<ResultValidation>('resultValidation', hospitalId as string);
        const resultValidation = await resultValidationColl.findOne({_id: new ObjectId(id as string)});
        if(resultValidation){
            await resultValidationColl.findOneAndDelete({_id: new ObjectId(id as string)});
            return res.status(201).json({
                message: "ResultValidation deleted successfully",
                success: true
            });
        }
        return res.status(404).json({
            message: "ResultValidation not found",
            success: false
        });
    }catch(error:any){
        console.error("Error in deleteResultValidation: ", error);
        return res.status(500).json({message: "Internal Server Error",
            success:false
        });
    }
}