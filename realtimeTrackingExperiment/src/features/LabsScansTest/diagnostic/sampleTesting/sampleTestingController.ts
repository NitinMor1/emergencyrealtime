import {Request, Response} from 'express';
import { getCollection } from '../../../../db/db';
import {v4 as uuidv4} from 'uuid';
import { SampleTesting } from '../testModel';
import { ObjectId } from 'mongodb';


export const initiateSampleTesting = async (req: Request, res: Response) => {
    try{
        const {
            orderId,
            
            sampleId,
            instrumentId,
            testParameters,
            rawDataFiles,
            results,
            technicianNotes
        } = req.body;
        const {hospitalId} = req.query;
        if(!hospitalId  ){
            return res.status(400).json({message: "HospitalId  are required",
                success: false
            });
        }
        const deconstructedData: SampleTesting = {
            
            orderId: orderId || "",
            testId: `tst_${uuidv4().substring(0,6)}`+ new Date().getTime(),
            sampleId: sampleId || `smp_${uuidv4().substring(0,6)}`+ new Date().getTime(),
            instrumentId: instrumentId,
            testParameters: testParameters || [],
            rawDataFiles: rawDataFiles || [],
            results: results || [],
            technicianNotes: technicianNotes || ""
        }
        const sampleTestingColl = await getCollection<SampleTesting>('sampleTesting', hospitalId as string);
        const sampleTesting = await sampleTestingColl.findOne({sampleId});
        if(sampleTesting){
            await sampleTestingColl.findOneAndUpdate({sampleId}, {$set: deconstructedData});
            return res.status(201).json({
                message: "Already existing sampleId, updated the existed sampleTesting",
                success: true
            });
        }
        await sampleTestingColl.insertOne(deconstructedData);
        return res.status(201).json({
            message: "SampleTesting initiated successfully",
            success: true
        });
    }catch(error:any){
        console.error("Error in initiateSampleTesting: ", error);
        return res.status(500).json({message: "Internal Server Error",
            success:false
        });
    }
}

export const getSampleTesting = async (req: Request, res: Response) => {
    try{
        const {hospitalId, id} = req.query;
        const sampleTestingColl = await getCollection<SampleTesting>('sampleTesting', hospitalId as string);
        const sampleTesting = await sampleTestingColl.findOne({_id: new ObjectId(id as string)});
        if(sampleTesting){
            return res.status(200).json({
                message: "SampleTesting found",
                success: true,
                data: sampleTesting
            });
        }
        return res.status(404).json({
            message: "SampleTesting not found",
            success: true
        });
    }catch(error:any){
        console.error("Error in getSampleTesting: ", error);
        return res.status(500).json({message: "Internal Server Error",
            success:false
        });
    }
}

export const getAllSampleTesting = async (req: Request, res: Response) => {
    try{
        const {hospitalId,orderId} = req.query;
        const sampleTestingColl = await getCollection<SampleTesting>('sampleTesting', hospitalId as string);
        const sampleTesting = await sampleTestingColl.find(
            {orderId:orderId}
        ).toArray();
        if(sampleTesting.length){
            return res.status(200).json({
                message: "SampleTesting found",
                success: true,
                data: sampleTesting
            });
        }
        return res.status(404).json({
            message: "SampleTesting not found",
            success: true
        });
    }catch(error:any){
        console.error("Error in getAllSampleTesting: ", error);
        return res.status(500).json({message: "Internal Server Error",
            success:false
        });
    }
}

export const updateSampleTesting = async (req: Request, res: Response) => {
    try{
        const {orderId,
            testId,
            sampleId,
            instrumentId,
            testParameters,
            rawDataFiles,
            results,
            technicianNotes
        } = req.body;
        const {id,hospitalId } = req.query;
        if(!hospitalId  ){
            return res.status(400).json({message: "HospitalId and InstrumentId are required",
                success: false
            });
        }
        const deconstructedData: SampleTesting = {
            orderId: orderId || "",
            testId: testId || `tst_${uuidv4().substring(0,6)}`+ new Date().getTime(),
            sampleId: sampleId || `smp_${uuidv4().substring(0,6)}`+ new Date().getTime(),
            instrumentId: instrumentId,
            testParameters: testParameters || [],
            rawDataFiles: rawDataFiles || [],
            results: results || [],
            technicianNotes: technicianNotes || ""
        }
        const sampleTestingColl = await getCollection<SampleTesting>('sampleTesting', hospitalId as string);
        const sampleTesting = await sampleTestingColl.findOne({_id: new ObjectId(id as string)});
        if(!sampleTesting){
            return res.status(404).json({
                message: "SampleTesting not found",
                success: true
            });
        }
        await sampleTestingColl.findOneAndUpdate({_id: new ObjectId(id as string)}, {$set: deconstructedData});
        return res.status(201).json({
            message: "SampleTesting updated successfully",
            success: true
        });
    }catch(error:any){
        console.error("Error in updateSampleTesting: ", error);
        return res.status(500).json({message: "Internal Server Error",
            success:false
        });
    }
}

export const deleteSampleTesting = async (req: Request, res: Response) => {
    try{
        const {hospitalId, id} = req.query;
        const sampleTestingColl = await getCollection<SampleTesting>('sampleTesting', hospitalId as string);
        const sampleTesting = await sampleTestingColl.findOne({_id: new ObjectId(id as string)});
        if(!sampleTesting){
            return res.status(404).json({
                message: "SampleTesting not found",
                success: true
            });
        }
        await sampleTestingColl.deleteOne({_id: new ObjectId(id as string)});
        return res.status(201).json({
            message: "SampleTesting deleted successfully",
            success: true
        });
    }catch(error:any){
        console.error("Error in deleteSampleTesting: ", error);
        return res.status(500).json({message: "Internal Server Error",
            success:false
        });
    }
}