import {Request, Response} from 'express';
import {notify, INotificationOfInvestigation} from './investigationNotificationModel';
import { getCollection } from '../../../db/db';



export const getAllNotification = async (req: Request, res: Response) => {
    try{
        const { hospitalId } = req.query;
        const investigationNotificationColl = await getCollection<INotificationOfInvestigation>("InvestigationNotification", hospitalId as string);
        const notifications = await investigationNotificationColl.find({}).toArray();
        if(!notifications){
            return res.status(404).json({
                message: "No Notifications Found",
                success: false
            })
        }
        return res.status(200).json({
            message: "All Notifications",
            success: true,
            notifications
        })

    }catch(error:any){
        console.error("Error in getAllNotification", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success:false
        })
    }
}