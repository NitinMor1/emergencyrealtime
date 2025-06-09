import { TestOrder, EOrderStatus } from "../diagnostic/testModel";
import { Request, Response } from "express";
import { getCollection } from "../../../db/db";
import { ObjectId } from "mongodb";


export const getTestOrder = async (req: Request, res: Response) => {
    try {
        const { hospitalId } = req.query;
        const testOrderCollection = await getCollection<TestOrder>("TestOrderNotification", hospitalId as string);
        const testOrders = await testOrderCollection.find({}).toArray();
        if (!testOrders) {
            return res.status(404).json({ message: "Test Orders Not Found", success: false });
        }
        return res.status(200).json({ message: "Test Orders Fetched", success: true, data: testOrders });
    } catch (error: any) {
        console.error("Error in get Test Order", error);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
}

export const getTestOrderById = async (req: Request, res: Response) => {
    try {
        const { hospitalId, id } = req.query;
        const testOrderCollection = await getCollection<TestOrder>("TestOrderNotification", hospitalId as string);
        const testOrder = await testOrderCollection.findOne({ _id: new ObjectId(id as string) });
        if (!testOrder) {
            return res.status(404).json({ message: "Test Order Not Found", success: false });
        }
        return res.status(200).json({ message: "Test Order Fetched", success: true, data: testOrder });

    } catch (error: any) {
        console.error("Error in get Test Order By Id", error);
        return res.status(500).json({ message: "Internal Server Error", success: false });
    }
}
