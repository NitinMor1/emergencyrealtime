import {Request, Response} from 'express'
import {getCollection} from '../../../../db/db'
import {ITestPackage, TestOrder} from '../testModel'
import { ObjectId } from 'mongodb';




export const addTestPackage = async (req: Request, res: Response) => {
    try{
        const {hospitalId,
            name,
            description,
            tests,
            totalPrice,
            icon,
            color
        } = req.body;
        if(!hospitalId ){
            return res.status(400).json({
                message: "Please provide hospitalId and testPackage", 
                success: false
            });
        }
        const testPackage:ITestPackage = {
            name,
            description,
            tests: tests || [],
            totalPrice: totalPrice || 0,
            icon: icon || "",
            color: color || ""
        }
        const testOrderCollection = await getCollection<ITestPackage>("TestPackages", hospitalId as string);
        const existingPackage = await testOrderCollection.insertOne(testPackage);
        if(!existingPackage){
            return res.status(500).json({
                message: "Failed to add test package", 
                success: false
            });
        }
        return res.status(200).json({
            message: "Test package added successfully", 
            success: true,
            data: existingPackage
        });
    }catch(error:any){
        console.error("Error in addTestPackage", error.message);
        return res.status(500).json({message: "Internal Server Error", success: false});
    }
}


export const getAllTestPackages = async (req: Request, res: Response) => {
    try{
        const {hospitalId} = req.query;
        if(!hospitalId){
            return res.status(400).json({
                message: "Please provide hospitalId", 
                success: false
            });
        }
        const testOrderCollection = await getCollection<ITestPackage>("TestPackages", hospitalId as string);
        const testPackages = await testOrderCollection.find({}).toArray();
        if(!testPackages || testPackages.length === 0){
            return res.status(404).json({
                message: "No test packages found", 
                success: false
            });
        }
        return res.status(200).json({
            message: "Test packages fetched successfully", 
            success: true,
            data: testPackages
        });
    }catch(error:any){
        console.error("Error in getAllTestPackages", error.message);
        return res.status(500).json({message: "Internal Server Error", success: false});
    }
}

export const deleteTestPackage = async (req: Request, res: Response) => {
    try{
        const {hospitalId, packageId} = req.query;
        if(!hospitalId || !packageId){
            return res.status(400).json({
                message: "Please provide hospitalId and packageId", 
                success: false
            });
        }
        const testOrderCollection = await getCollection<ITestPackage>("TestPackages", hospitalId as string);
        const deleteResult = await testOrderCollection.deleteOne({_id: new ObjectId(packageId as string)});
        if(deleteResult.deletedCount === 0){
            return res.status(404).json({
                message: "Test package not found", 
                success: false
            });
        }
        return res.status(200).json({
            message: "Test package deleted successfully", 
            success: true
        });
    }catch(error:any){
        console.error("Error in deleteTestPackage", error.message);
        return res.status(500).json({message: "Internal Server Error", success: false});
    }
}


export const updateTestPackage = async (req: Request, res: Response) => {
    try{
        const {hospitalId, packageId} = req.query;
        const {name, description, tests, totalPrice, icon, color} = req.body;
        if(!hospitalId || !packageId){
            return res.status(400).json({
                message: "Please provide hospitalId and packageId", 
                success: false
            });
        }
        const testOrderCollection = await getCollection<ITestPackage>("TestPackages", hospitalId as string);
        const existingPackage = await testOrderCollection.findOne({_id: new ObjectId(packageId as string)});
        if(!existingPackage){
            return res.status(404).json({
                message: "Test package not found", 
                success: false
            });
        }
        const testPackage: ITestPackage = {
            name: existingPackage?.name || "",
            description: existingPackage?.description || "",
            tests: existingPackage?.tests || [],
            totalPrice: existingPackage?.totalPrice || 0,
            icon: existingPackage?.icon || "",
            color: existingPackage?.color || ""
        }
        const result = await testOrderCollection.findOneAndUpdate({
            _id: new ObjectId(packageId as string)
        }, {
            $set: {
                name: name || testPackage.name,
                description: description || testPackage.description,
                tests: tests || testPackage.tests,
                totalPrice: totalPrice || testPackage.totalPrice,
                icon: icon || testPackage.icon,
                color: color || testPackage.color
            }
        }, {
            returnDocument: "after"
        })
        if(!result){
            return res.status(500).json({
                message: "Failed to update test package", 
                success: false
            });
        }
        return res.status(200).json({
            message: "Test package updated successfully", 
            success: true,
            data: result
        });
    }catch(error:any){
        console.error("Error in updateTestPackage", error.message);
        return res.status(500).json({message: "Internal Server Error", success: false});
    }
}