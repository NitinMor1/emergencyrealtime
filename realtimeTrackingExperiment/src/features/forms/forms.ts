import {Request, Response} from 'express';
import { IFormModel } from './formsModel';
import { getCollection } from '../../db/db';


export const getAllDynamicForms = async (req: Request, res: Response) => {
    try{
        const {hospitalId} = req.query;
        if(!hospitalId){
            return res.status(400).json({success:false,message:"Invalid Request"});
        }
        const dynamicFormColl = await getCollection<IFormModel>("defaultForms", hospitalId.toString());
        const result = await dynamicFormColl.find().toArray();
        return res.status(200).json({success:true,data:result});
    }catch(error:any){
        console.error("Error in getAllDynamicForms: ", error);
        res.status(500).json({success:false,message:"Internal Server Error"});
    }
}