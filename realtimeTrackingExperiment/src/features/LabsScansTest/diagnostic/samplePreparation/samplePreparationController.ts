import { EPreparationStatus, SamplePreparation } from "../testModel";
import { Request, Response } from "express";
import { getCollection } from "../../../../db/db";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "mongodb";

export const initiateSamplePreparation = async (req: Request, res: Response) => {
    try{
        const {
            orderId,
            hospitalId,
            preparationId,
            sampleId,
            protocolId,
            technicianId,
            equipmentUsed,
            reagents,
            deviations,
            startTime,
            endTime,
            preparationStatus
        } = req.body;
        const samplePreparation: SamplePreparation = {
            orderId:orderId|| "",
            preparationId : preparationId || `prep_${uuidv4().substring(0,6)}`+ new Date().getTime(),
            sampleId: sampleId || `smp_${uuidv4().substring(0,6)}`+ new Date().getTime(),
            protocolId: protocolId || `pcol_${uuidv4().substring(0,6)}`+ new Date().getTime(),
            technicianId: technicianId || `emp_${uuidv4().substring(0,6)}`+ new Date().getTime(),
            equipmentUsed: equipmentUsed || [],
            reagents: reagents || [],
            deviations: deviations || [],
            startTime: startTime || new Date().toISOString(),
            endTime: endTime || new Date().toISOString(),
            preprationStatus: preparationStatus || EPreparationStatus.INITIATED
        }
        const samplePreprationColl = await getCollection<SamplePreparation>("samplePreparation", hospitalId?.toString());
        const samplePreparationData = await samplePreprationColl.insertOne(samplePreparation);
        res.status(200).send(samplePreparationData);
    }catch(error:any){
        console.error("Error in initiateSamplePreparation: ", error);
    }
}

export const updateSamplePreparation = async (req: Request, res: Response) => {
    try{
        const {hospitalId, id} = req.query;
        const {
            preparationId,
            sampleId,
            protocolId,
            technicianId,
            equipmentUsed,
            reagents,
            deviations,
            startTime,
            endTime,
            preparationStatus
        } = req.body;
        const samplePreparationColl = await getCollection<SamplePreparation>("samplePreparation", hospitalId?.toString());
        const samplePreparationData = await samplePreparationColl.findOne({_id: new ObjectId(id as string)});
        if(!samplePreparationData){
            return res.status(404).json({
                message:"Sample Preparation not found",
                success:false
            });
        }
        const deconstructedSamplePreparation = {
            preparationId: preparationId || samplePreparationData.preparationId,
            sampleId: sampleId || samplePreparationData.sampleId,
            protocolId: protocolId || samplePreparationData.protocolId,
            technicianId: technicianId || samplePreparationData.technicianId,
            equipmentUsed: equipmentUsed || samplePreparationData.equipmentUsed,
            reagents: reagents || samplePreparationData.reagents,
            deviations: deviations || samplePreparationData.deviations,
            startTime: startTime || samplePreparationData.startTime,
            endTime: endTime || samplePreparationData.endTime,
            preparationStatus: preparationStatus || samplePreparationData.preprationStatus
        }
        await samplePreparationColl.findOneAndUpdate({_id: new ObjectId(id as string)}, {$set: deconstructedSamplePreparation});
        return res.status(200).json({
            message:"Sample Preparation updated successfully",
            success:true
        })
    }catch(error:any){
        console.error("Error in updateSamplePreparation: ", error);
        return res.status(500).json({
            message:"Internal Server Error",
            success:false
        });
    }
}

export const deleteSamplePreparation = async (req: Request, res: Response) => {
    try{
        const {hospitalId, id} = req.query;
        const samplePreparationColl = await getCollection<SamplePreparation>("samplePreparation", hospitalId?.toString());
        const samplePreparationData = await samplePreparationColl.findOneAndDelete({_id: new ObjectId(id as string)});
        if(!samplePreparationData){
            return res.status(404).json({
                message:"Sample Preparation not found",
                success:false
            });
        }
        return res.status(200).json({
            message:"Sample Preparation deleted successfully",
            success:true
        })
    }catch(error:any){
        console.error("Error in deleteSamplePreparation: ", error);
        return res.status(500).json({
            message:"Internal Server Error",
            success:false
        })
    }
}

export const getAllSamplePreparation = async (req: Request, res: Response) => {
    try{
        const {hospitalId,orderId} = req.query;
        const samplePreparationColl = await getCollection<SamplePreparation>("samplePreparation", hospitalId?.toString());
        const samplePreparationData = await samplePreparationColl.find({
            orderId: orderId
        }).toArray();
        if(!samplePreparationData){
            return res.status(404).json({
                message:"Sample Preparation not found",
                success:false
            });
        }
        return res.status(200).json({
            message:"Sample Preparation fetched successfully",
            success:true,
            data: samplePreparationData
        })
    }catch(error:any){
        console.error("Error in getAllSamplePreparation: ", error);
        return res.status(500).json({
            message:"Internal Server Error",
            success:false
        })
    }
}