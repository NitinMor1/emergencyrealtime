import { ETaskStatus, TaskAllocation } from "../testModel";
import { Request, Response } from "express";
import { getCollection } from "../../../../db/db";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "mongodb";


export const allocateTask = async (req: Request, res: Response) => {
    try{
        const {
            orderId,
            hospitalId,
            taskId,
            sampleId,
            assignedTo,
            equipmentRequirements,
            deadline,
            taskStatus,
            priorityScore,
            dependencies
        } = req.body;
        const taskAllocation: TaskAllocation = {
            orderId: orderId || "",
            taskId : taskId || `tsk_${uuidv4().substring(0,6)}`+ new Date().getTime(),
            sampleId: sampleId || "",
            assignedTo: assignedTo || "",
            equipmentRequirements: equipmentRequirements || [],
            deadline: deadline || new Date().toISOString(),
            taskStatus: taskStatus || ETaskStatus.UNASSIGNED,
            priorityScore: priorityScore || 0,
            dependencies: dependencies || []
        }
        const taskAllocationColl = await getCollection<TaskAllocation>("taskAllocation", hospitalId?.toString());
        await taskAllocationColl.insertOne(taskAllocation);
        res.status(200).json(
            {
                message:"Task Allocated Successfully",
                success:true
            }
        );
    }catch(error:any){
        console.error("Error in initiateTaskAllocation: ", error);
        return res.status(500).json({
            message:"Internal Server Error",
            success:false
    });
    }
}

export const updateTaskAllocation = async (req: Request, res: Response) => {
    try{
        const {hospitalId, id} = req.query;
        const {
            taskId,
            sampleId,
            assignedTo,
            equipmentRequirements,
            deadline,
            taskStatus,
            priorityScore,
            dependencies
        } = req.body;
        const taskAllocationColl = await getCollection<TaskAllocation>("taskAllocation", hospitalId?.toString());
        const taskAllocationData = await taskAllocationColl.findOne({_id: new ObjectId(id as string)});
        if(!taskAllocationData){
            return res.status(404).json({
                message:"Task Allocation not found",
                success:false
            });
        }
        const deconstructedTaskAllocation = {
            taskId: taskId || taskAllocationData.taskId,
            sampleId: sampleId || taskAllocationData.sampleId,
            assignedTo: assignedTo || taskAllocationData.assignedTo,
            equipmentRequirements: equipmentRequirements || taskAllocationData.equipmentRequirements,
            deadline: deadline || taskAllocationData.deadline,
            taskStatus: taskStatus || taskAllocationData.taskStatus,
            priorityScore: priorityScore || taskAllocationData.priorityScore,
            dependencies: dependencies || taskAllocationData.dependencies
        }
        await taskAllocationColl.findOneAndUpdate({_id: new ObjectId(id as string)}, {$set: deconstructedTaskAllocation});
        return res.status(200).json({
            message:"Task Allocation updated successfully",
            success:true
        })
    }catch(error:any){
        console.error("Error in updateTaskAllocation: ", error);
        return res.status(500).json({
            message:"Internal Server Error",
            success:false
        });
    }
}

export const deleteTaskAllocation = async (req: Request, res: Response) => {
    try{
        const {hospitalId, id} = req.query;
        const taskAllocationColl = await getCollection<TaskAllocation>("taskAllocation", hospitalId?.toString());
        const taskAllocationData = await taskAllocationColl.findOneAndDelete({_id: new ObjectId(id as string)});
        if(!taskAllocationData){
            return res.status(404).json({
                message:"Task Allocation not found",
                success:false
            });
        }
        return res.status(200).json({
            message:"Task Allocation deleted successfully",
            success:true
        });
    }catch(error:any){
        console.error("Error in deleteTaskAllocation: ", error);
        return res.status(500).json({
            message:"Internal Server Error",
            success:false
        });
    }
}

export const getAllTaskAllocationByorderId = async (req: Request, res: Response) => {
    try{
        const {hospitalId,orderId} = req.query;
        const taskAllocationColl = await getCollection<TaskAllocation>("taskAllocation", hospitalId?.toString());
        const taskAllocationData = await taskAllocationColl.find(
            {
                orderId: orderId
            }
        ).toArray();
        if(!taskAllocationData){
            return res.status(404).json({
                message:"Task Allocation not found",
                success:false
            });
        }
        return res.status(200).json({
            message:"Task Allocation fetched successfully",
            success:true,
            data:taskAllocationData
        });
    }catch(error:any){
        console.error("Error in getAllTaskAllocation: ", error);
        return res.status(500).json({
            message:"Internal Server Error",
            success:false
        });
    }
}

export const getAllTaskAllocationBySampleId = async (req: Request, res: Response) => {
    try{
        const {hospitalId,sampleId} = req.query;
        const taskAllocationColl = await getCollection<TaskAllocation>("taskAllocation", hospitalId?.toString());
        const taskAllocationData = await taskAllocationColl.find(
            {
                sampleId: sampleId
            }
        ).toArray();
        if(!taskAllocationData){
            return res.status(404).json({
                message:"Task Allocation not found",
                success:false
            });
        }
        return res.status(200).json({
            message:"Task Allocation fetched successfully",
            success:true,
            data:taskAllocationData
        });
    }catch(error:any){
        console.error("Error in getAllTaskAllocation: ", error);
        return res.status(500).json({
            message:"Internal Server Error",
            success:false
        });
    }
}