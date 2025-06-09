import {Request, Response} from 'express';
import {getCollection} from '../../../db/db';
import { IItem } from '../../resource/Inventory/inventoryModel';




export const getVendors = async (req: Request, res: Response) => {
    try{
        const {hospitalId} = req.query;
        const vendorColl = await getCollection<IItem>("Item", hospitalId as string);
        const vendors = await Promise.all([
            vendorColl.distinct("vendorName"),
            vendorColl.distinct("vendorId"),
            vendorColl.distinct("itemType"),
            vendorColl.distinct("name"),
            vendorColl.distinct("subType"),
        ]);
        const vendorList = vendors[0].map((vendor, index) => ({
            vendorName: vendor,
            vendorId: vendors[1][index],
            itemType: vendors[2][index],
            name: vendors[3][index],
            subType: vendors[4][index],
        }));
        if(vendorList.length === 0 || vendorList[0].vendorName === null || !vendorList){
            return res.status(404).json({
                message: "No vendors found",
                success:false
            })
        }
        return res.status(200).json({
            message: "Vendors fetched successfully",
            success:true,
            data: vendorList
        })
    }catch (error) {
        console.error("Error fetching vendors:", error);
        return res.status(500).json({
            message: "Internal server error",
            success:false
        })
    }
}

export const getItemNames = async (req: Request, res: Response) => {
    try{
        const {hospitalId} = req.query;
        const vendorColl = await getCollection<IItem>("Item", hospitalId as string);
        const itemNames = await vendorColl.distinct("name");
        if(itemNames.length === 0 || itemNames[0] === null || !itemNames){
            return res.status(404).json({
                message: "No item names found",
                success:false
            })
        }
        return res.status(200).json({
            message: "Item names fetched successfully",
            success:true,
            data: itemNames
        })
    }catch(error:any){
        console.error("Error fetching item names:", error);
        return res.status(500).json({
            message: "Internal server error",
            success:false
        })
    }
}

export const getVendorByItemName = async (req: Request, res: Response) => {
    try{
        const {hospitalId, itemName} = req.query;
        const vendorColl = await getCollection<IItem>("Item", hospitalId as string);
        const vendors = await vendorColl.find({name:itemName}).toArray();
        if(vendors.length === 0 || vendors[0].vendorName === null || !vendors){
            return res.status(404).json({
                message: "No vendors found",
                success:false
            })
        }
        return res.status(200).json({
            message: "Vendors fetched successfully",
            success:true,
            data: vendors
        })
    }catch (error: any) {
        console.error("Error fetching vendor by item name:", error);
        return res.status(500).json({
            message: "Internal server error",
            success:false
        })
    }
}