import { TestOrder } from "../testModel";
import { Request, Response } from "express";
import { getCollection } from "../../../../db/db";
import { ObjectId } from "mongodb";



export const orderTest = async (req: Request, res: Response) => {
    try{
        const {
            hospitalId,
            orderId,
            patientId,
            patientName,
            physicianId,
            requiredTests,
            clinicalRationale,
            priority,
            samplesRequired,
            orderStatus,
            billingReference,
            createdAt,
            updatedAt,
            testPackage
        } = req.body;
        if(!hospitalId || !patientId || requiredTests.lenght === 0){
            return res.status(400).json({
                message: "please provide hospitalId, patientId and requiredTests", 
                success: false
            });
        }
        const testOrder : TestOrder = {
            hospitalId:hospitalId?.toString(),
            patientName: patientName ?? "",
            orderId: orderId ?? `test_${Date.now()}`,
            patientId: patientId?.toString(),
            physicianId: physicianId?.toString(),
            requiredTests: requiredTests ?? [],
            clinicalRationale: clinicalRationale ?? "",
            priority: priority ?? "Routine",
            samplesRequired: samplesRequired ?? 1,
            orderStatus: orderStatus ?? "Pending",
            billingReference: billingReference ?? "",
            createdAt: createdAt ?? new Date().toISOString(),
            updatedAt : updatedAt ?? new Date().toISOString(),
            paymentStatus: false,
            testPackages: testPackage ?? [],
        };

        const testOrderCollection = await getCollection<TestOrder>("TestOrder", hospitalId?.toString());
        await testOrderCollection.insertOne(testOrder);
        return res.status(200).json({message: "Test Order Created", success: true, data: testOrder});
    }catch(error:any){
        console.error("Error in order Test", error);
        return res.status(500).json({message: "Internal Server Error", success: false});
    }
}

export const getTestOrder = async (req: Request, res: Response) => {
    try{
        const {hospitalId }= req.query;
        const testOrderCollection = await getCollection<TestOrder>("TestOrder", hospitalId as string);
        const testOrders = await testOrderCollection.find({}).toArray();
        if(!testOrders){
            return res.status(404).json({message: "Test Orders Not Found", success: false});
        }
        return res.status(200).json({message: "Test Orders Fetched", success: true, data: testOrders});
    }catch(error:any){
        console.error("Error in get Test Order", error);
        return res.status(500).json({message: "Internal Server Error", success: false});
    }
}

export const getTestOrderById = async (req: Request, res: Response) => {
    try{
        const {hospitalId, id} = req.query;
        const testOrderCollection = await getCollection<TestOrder>("TestOrder", hospitalId as string);
        const testOrder = await testOrderCollection.findOne({_id: new ObjectId(id as string)});
        if(!testOrder){
            return res.status(404).json({message: "Test Order Not Found", success: false});
        }
        return res.status(200).json({message: "Test Order Fetched", success: true, data: testOrder});

    }catch(error:any){
        console.error("Error in get Test Order By Id", error);
        return res.status(500).json({message: "Internal Server Error", success: false});
    }
}

export const updateTestOrder = async (req: Request, res: Response) => {
    try{
        const {hospitalId, id} = req.query;
        const testOrderCollection = await getCollection<TestOrder>("TestOrder", hospitalId as string);
        const testOrder = await testOrderCollection.findOne({_id: new ObjectId(id as string)});
        if(!testOrder){
            return res.status(404).json({message: "Test Order Not Found", success: false});
        }
        const {
            orderId,
            patientId,
            physicianId,
            requiredTests,
            clinicalRationale,
            priority,
            samplesRequired,
            orderStatus,
            billingReference,
            createdAt,
            updatedAt,
            paymentStatus,
        } = req.body;
        const updatedTestOrder = {
            hospitalId:hospitalId as string,
            orderId: orderId ??  testOrder.orderId,
            patientId: patientId?.toString(),
            physicianId: physicianId?.toString(),
            requiredTests: requiredTests ??  testOrder.requiredTests,
            clinicalRationale: clinicalRationale ??  testOrder.clinicalRationale,
            priority: priority ??  testOrder.priority,
            samplesRequired: samplesRequired ??  testOrder.samplesRequired,
            orderStatus: orderStatus ??  testOrder.orderStatus,
            billingReference: billingReference ??  testOrder.billingReference,
            createdAt: createdAt ??  testOrder.createdAt,
            updatedAt : updatedAt ?? new Date().toISOString(),
            paymentStatus: paymentStatus ?? testOrder.paymentStatus,
        };
        await testOrderCollection.updateOne({_id: new ObjectId(id as string)}, {$set: updatedTestOrder});
        if(!testOrder){
            return res.status(404).json({message: "Test Order Not Found", success: false});
        }
        return res.status(200).json({message: "Test Order Updated", success: true, data: updatedTestOrder});
    }catch(error:any){
        console.error("Error in update Test Order", error.message);
        return res.status(500).json({message: "Internal Server Error", success: false});
    }
}


export const deleteTestOrder = async (req: Request, res: Response) => {
    try{
        const {hospitalId, id} = req.query;
        const testOrderCollection = await getCollection<TestOrder>("TestOrder", hospitalId as string);
        const testOrder = await testOrderCollection.findOne({_id: new ObjectId(id as string)});
        if(!testOrder){
            return res.status(404).json({message: "Test Order Not Found", success: false});
        }
        await testOrderCollection.deleteOne({_id: new ObjectId(id as string)});
        return res.status(200).json({message: "Test Order Deleted", success: true});
    }catch(error:any){
        console.error("Error in delete Test Order", error.message);
        return res.status(500).json({message: "Internal Server Error", success: false});
    }
}
