import { Request, Response } from "express";
import { getCollection } from "../../../../db/db";
import { ESampleStatus, SampleCollection } from "./sampleCollectionModel";
import { v4 as uuidv4 } from 'uuid';
import { SampleRegistration } from "../testModel";


export const getSampleCollection = async (req: Request, res: Response) => {
    try {
        const { hospitalId, empId } = req.query;
        const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
        const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
        const limit = upperLimit - lowerLimit; // Calculate the limit for the query

        if (limit <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid range: upperLimit must be greater than lowerLimit"
            });
        }
        if (!hospitalId || !empId) {
            return res.status(400).json({
                success: false,
                message: "hospitalid and empId are required"
            })
        }
        const sampleCollection = await getCollection<SampleCollection>("sampleCollection", hospitalId?.toString());
        const result = await sampleCollection.find({ empId: empId?.toString() }).skip(lowerLimit).limit(limit).toArray();
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "No sample collection found"
            })
        }
        return res.status(200).json({
            success: true,
            data: result
        })
    } catch (error: any) {
        console.error("Error in getSampleCollection", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

// export const createSampleCollection = async (req: Request, res: Response) => {
//     try {
//         const {
//             hospitalId,
//             patientId,
//             empId,
//             sampleDetails,
//             sampleType,
//             timeOfSampleCollection,
//             sampleStatus
//         } = req.body;
//         if (!hospitalId || !patientId || !empId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "All fields are required"
//             })
//         }
//         const sampleCollection = await getCollection<SampleCollection>("sampleCollection", hospitalId);
//         const data: SampleCollection = {
//             sampleId: `smp_${uuidv4().substring(0, 6)}`, // or use any unique id generator
//             hospitalId: hospitalId.toString(),
//             patientId: patientId.toString(),
//             empId: empId.toString(),
//             sampleDetails: sampleDetails.toString(),
//             sampleType: sampleType.toString(),
//             timeOfSampleCollection: timeOfSampleCollection.toString(),
//             sampleStatus: sampleStatus.toString()
//         }
//         await sampleCollection.insertOne(data);
//         return res.status(201).json({
//             success: true,
//             data: data
//         });
//     } catch (error: any) {
//         console.error("Error in createSampleCollection", error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal Server Error"
//         })
//     }
// }


export const updateSampleCollection = async (req: Request, res: Response) => {
    try {
        const { hospitalId, sampleId } = req.query;
        if (!hospitalId || !sampleId) {
            return res.status(400).json({
                success: false,
                message: "hospitalId and sampleId are required"
            })
        }
        const result = req.body;
        const sampleCollection = await getCollection<SampleCollection>("sampleCollection", hospitalId?.toString());
        const finalResult = await sampleCollection.updateOne({ sampleId: sampleId?.toString() }, { $set: result });
        return res.status(200).json({
            success: true,
            data: finalResult
        });
    } catch (error: any) {
        console.error("Error in updateSampleCollection", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const deleteSampleCollection = async (req: Request, res: Response) => {
    try {
        const { hospitalId, sampleId } = req.query;
        if (!hospitalId || !sampleId) {
            return res.status(400).json({
                success: false,
                message: "hospitalId and sampleId are required"
            })
        }
        const sampleCollection = await getCollection<SampleCollection>("sampleCollection", hospitalId?.toString());
        const result = await sampleCollection.deleteOne({ sampleId: sampleId?.toString() });
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "No sample collection found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Sample Collection Deleted"
        })
    } catch (error: any) {
        console.error("Error in deleteSampleCollection", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const getAllSampleCollection = async (req: Request, res: Response) => {
    try {
        const { hospitalId } = req.query;
        const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
        const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
        const limit = upperLimit - lowerLimit; // Calculate the limit for the query

        if (limit <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid range: upperLimit must be greater than lowerLimit"
            });
        }
        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "hospitalId is required"
            })
        }
        const sampleCollection = await getCollection<SampleCollection>("sampleCollection", hospitalId?.toString());
        const result = await sampleCollection.find().skip(lowerLimit).limit(limit).toArray();
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "No sample collection found"
            })
        }
        return res.status(200).json({
            success: true,
            data: result
        })
    } catch (error: any) {
        console.error("Error in getAllSampleCollection", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}


export const sampleRegistration = async (req: Request, res: Response) => {
    try{
        const {
            orderId,
            patientId,
            empId,
            hospitalId,
            sampleDetails,
            sampleType,
            timeOfSampleCollection,
            sampleStatus,
            registrationNumber,
            barcode,
            collectionDevice,
            preservativeUsed,
            storageRequirements,
            chainOfCustody,
        } = req.body;
        const sampleData : SampleRegistration = {
            orderId: orderId.toString() || "",
            sampleId:  `smp_${uuidv4().substring(0, 6)}`+ new Date().getTime(), // or use any unique id generator
            patientId: patientId.toString() || "",
            empId: empId.toString() || "",
            hospitalId: hospitalId.toString() || "",
            sampleDetails: sampleDetails.toString() || "",
            sampleType: sampleType.toString() || "",
            timeOfSampleCollection: timeOfSampleCollection.toString() || "",
            sampleStatus: sampleStatus.toString() || ESampleStatus.NOTCOLLECTED,
            registrationNumber: registrationNumber.toString() || "",
            barcode: barcode.toString() || "",
            collectionDevice: collectionDevice.toString() || "",
            preservativeUsed: preservativeUsed.toString() || "",
            storageRequirements: storageRequirements.toString() || "",
            chainOfCustody: chainOfCustody || []
        }
        const sampleRegistrationColl = await getCollection<SampleRegistration>("SampleRegistration", hospitalId as string);
        await sampleRegistrationColl.insertOne(sampleData);
        return res.status(201).json({
            success: true,
            message:"Sample Registered Successfully",
            data: sampleData
        })
    }catch(error:any){
        console.error("Error in SampleRegistration", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const updateSampleRegistration = async (req: Request, res: Response) => {
    try {
        const { hospitalId, sampleId,orderId } = req.query;
        if (!hospitalId || !sampleId) {
            return res.status(400).json({
                success: false,
                message: "hospitalId and sampleId are required"
            })
        }
        const result = req.body;
        const sampleRegistration = await getCollection<SampleRegistration>("SampleRegistration", hospitalId?.toString());
        const finalResult = await sampleRegistration.updateOne({ sampleId: sampleId?.toString() , orderId: orderId }, { $set: result });
        return res.status(200).json({
            success: true,
            data: finalResult
        });
    } catch (error: any) {
        console.error("Error in updateSampleRegistration", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const deleteSampleRegistration = async (req: Request, res: Response) => {
    try {
        const { hospitalId, sampleId } = req.query;
        if (!hospitalId || !sampleId) {
            return res.status(400).json({
                success: false,
                message: "hospitalId and sampleId are required"
            })
        }
        const sampleRegistration = await getCollection<SampleRegistration>("SampleRegistration", hospitalId?.toString());
        const result = await sampleRegistration.deleteOne({ sampleId: sampleId?.toString() });
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "No sample collection found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Sample Collection Deleted"
        })
    } catch (error: any) {
        console.error("Error in deleteSampleRegistration", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}


export const getAllSampleByOrderId = async (req: Request, res: Response) => {
    try{
        const { hospitalId, orderId } = req.query;
        // const limit = parseInt(upperLimit as string) - parseInt(lowerLimit as string);
        // if (limit <= 0) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Invalid range: upperLimit must be greater than lowerLimit"
        //     });
        // }
        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "hospitalId is required"
            })
        }
        const sampleRegistration = await getCollection<SampleRegistration>("SampleRegistration", hospitalId?.toString());
        const result = await sampleRegistration.find(
            {
                orderId: orderId?.toString()
            }

        ).toArray();
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "No sample collection found"
            })
        }
        return res.status(200).json({
            success: true,
            data: result
        })
    }catch(error:any){
        console.error("Error in getAllSample", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}