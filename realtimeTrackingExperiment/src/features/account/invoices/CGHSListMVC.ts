import { Request, Response, Router } from "express";
import { getCollection } from "../../../db/db";
import { ObjectId } from "mongodb";
import { verifyJWT } from "../../auth/ctrl_func";
import { extractPriceFromXlsxFile, upload } from "../../auth/controller";

const pricingRouter = Router();


export interface pricing {
    name: string;
    NABHPrice: number;
    NON_NABHPrice: number;
    CustomPrice: ICustomPrice[];
}

export interface ICustomPrice {
    name: string;
    CustomPrice: number;
}



pricingRouter.post("/addCustomPrice", async (req: Request, res: Response) => {
    try{
        const { hospitalId, id } = req.query;
        const mongoId = new ObjectId(id as string);
        const hospitalColl = await getCollection<pricing>("Prices", hospitalId as string);
        const {  CustomPrice } = req.body;
        const data: ICustomPrice = {
            name: CustomPrice.name,
            CustomPrice: CustomPrice.CustomPrice
        }
        const price = await hospitalColl.findOneAndUpdate({_id: mongoId}, {$addToSet: 
            {CustomPrice: data}},{returnDocument: "after"});

        if(!price){
            return res.status(404).json({
                success: false,
                message: "Price not found"
            })
        }
        return res.status(201).json({
            success: true,
            message: "Price updated successfully"
        })
    }catch(error:any){
        console.error("Error in adding price "+error);
        return res.status(500).json({
            success: false,
            message: "Error in adding"
        })
    }
})

pricingRouter.get("/getPrices", async (req: Request, res: Response) => {
    try{
        const { hospitalId } = req.query;
        const hospitalColl = await getCollection<pricing>("Prices", hospitalId as string);
        const prices = await hospitalColl.find({}).toArray();
        if(!prices){
            return res.status(404).json({
                message: "Prices not found",
                success: true
            })
        }
        return res.status(200).json({
            success: true,
            prices: prices
        })
    }catch(error:any){
        console.log("Error in getting prices "+error);
        return res.status(500).json({
            success: false,
            message: "Error in getting prices"
        })
    }
})

pricingRouter.post("/updatePricingList", async (req: Request, res: Response) => {
    try{
        const {hospitalId} = req.query;
        const {name, NABHPrice, NON_NABHPrice, CustomPrice} = req.body;
        const data : pricing = {
            name: name,
            NABHPrice: NABHPrice ?? 0,
            NON_NABHPrice: NON_NABHPrice ?? 0,
            CustomPrice: CustomPrice ?? []
        }
        const hospitalColl = await getCollection<pricing>("Prices", hospitalId as string);
        const price = await hospitalColl.insertOne(data);
        if(!price){
            return res.status(404).json({
                success: false,
                message: "Price not found"
            })
        }
        return res.status(201).json({
            success: true,
            message: "Price updated successfully"
        })
    }catch(error:any){
        console.log("Error in updating pricing list "+error);
        return res.status(500).json({
            success: false,
            message: "Error in updating pricing list"
        })
    }
})

export const getOpdPrice = async (req:Request, res:Response) => {
    try {
        const {hospitalId} = req.query;
        const hospitalColl = await getCollection<pricing>("Prices", hospitalId as string);
        const prices = await hospitalColl.findOne({
            name:"Consultation- OPD"
        });
        if(!prices){
            return res.status(404).json({
                success: false,
                message: "Price not found"
            })
        }
        return res.status(200).json({
            success: true,
            prices: prices
        })
        

    } catch (error : any) {
        console.error("Error in getting OPD price "+error.message);
        return res.status(500).json({
            success: false,
            message: "Error in getting OPD price"
        })
    }
}


pricingRouter.route("/getTestPrices").get(verifyJWT,  async (req: Request, res: Response)=>{
    try{
        const {hospitalId} = req.query;
        const testPricesColl = await getCollection<pricing>("TestPrices", hospitalId as string);
        const prices = await testPricesColl.find({}).toArray();
        if(!prices){
            return res.status(404).json({
                success: false,
                message: "Prices not found"
            })
        }
        return res.status(200).json({
            message: "Prices fetched successfully",
            success: true,
            data: prices
        })
    }catch(error:any){
        console.error("Error in getting test prices "+error.message);
        return res.status(500).json({
            success: false,
            message: "Error in getting test prices"
        })
    }
})


pricingRouter.route("/addTestPrice").post(verifyJWT, async (req: Request, res: Response)=>{
    try{
        const {hospitalId} = req.query;
        const {name, NABHPrice, NON_NABHPrice, CustomPrice} = req.body;
        const data: pricing = {
            name: name,
            NABHPrice: NABHPrice ?? 0,
            NON_NABHPrice: NON_NABHPrice ?? 0,
            CustomPrice: CustomPrice ?? []
        }
        const testPricesColl = await getCollection<pricing>("TestPrices", hospitalId as string);
        const price = await testPricesColl.insertOne(data);
        if(!price){
            return res.status(404).json({
                success: false,
                message: "Price not found"
            })
        }
        return res.status(201).json({
            success: true,
            message: "Price added successfully"
        })
    }catch(error:any){
        console.error("Error in adding test price "+error.message);
        return res.status(500).json({
            success: false,
            message: "Error in adding test price"
        })
    }
})


pricingRouter.route("/addCustomTestPrice").post(verifyJWT, async (req: Request, res: Response) => {
    try{
        const { hospitalId, id } = req.query;
        const mongoId = new ObjectId(id as string);
        const hospitalColl = await getCollection<pricing>("TestPrices", hospitalId as string);
        const {  CustomPrice } = req.body;
        const data: ICustomPrice = {
            name: CustomPrice.name,
            CustomPrice: CustomPrice.CustomPrice
        }
        const price = await hospitalColl.findOneAndUpdate({_id: mongoId}, {$addToSet: 
            {CustomPrice: data}},{returnDocument: "after"});

        if(!price){
            return res.status(404).json({
                success: false,
                message: "Price not found"
            })
        }
        return res.status(201).json({
            success: true,
            message: "Price updated successfully"
        })
    }catch(error:any){
        console.error("Error in adding price "+error);
        return res.status(500).json({
            success: false,
            message: "Error in adding"
        })
    }
});

pricingRouter.route("/uploadTestPrices").post(verifyJWT, upload.single("file"), async (req: Request, res: Response) => {
    try{
            const { hospitalId } = req.query;
            const file = req.file?.path;
            if(!file){
                return res.status(400).json({
                    success: false,
                    message: "File not found"
                })
            }
            const priceColl = await getCollection<pricing>("TestPrices", hospitalId as string);
            const prices = await extractPriceFromXlsxFile(file);
            await priceColl.insertMany(prices);

            return res.status(201).json({
                success: true,
                message: "Test prices uploaded successfully"
            })
            
    }catch(error:any){
        console.error("Error in uploading test prices "+error.message);
        return res.status(500).json({
            success: false,
            message: "Error in uploading test prices"
        })
    }
})

pricingRouter.route("/getOpdPrice").get(verifyJWT, getOpdPrice);
export default pricingRouter;