import { IIPD, roomType } from "../ipd/ipdModel";
import { getCollection } from "../../db/db";
import { ISurgery, ITestResult, iv, STATUS, anaesthesiaName, TYPE } from "./surgeryModel";
import { Request, Response } from "express";
import { ObjectId } from 'mongodb';
import { IEquipment } from "../equipments/equipmentModel";
import { IItem, ITEMTYPE } from "../resource/Inventory/inventoryModel";
import { isExpired } from "../ipd/ipdController";

export const getAllSurgeries = async (req: Request, res: Response) => {
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
                success: true,
                message: "hospital parameter is missing !"
            })
        }
        const surgeryColl = await getCollection<ISurgery>(
            "Surgeries", hospitalId?.toString());
        const surgeries: ISurgery[] = await surgeryColl.find().skip(lowerLimit).limit(limit).toArray();
        if (surgeries.length == 0) {
            return res.status(404).json({
                success: true,
                message: "No surgery found."
            })
        }
        return res.status(200).json({
            success: true,
            message: "Surgeries fetched successfully.",
            data: surgeries
        })
    } catch (error: any) {
        console.error("Error in fetching a surgery", error)
        return res.status(500).json({
            success: false,
            message: "Error in fetching a surgery"
        })
    }
}

export const addSurgery = async (req: Request, res: Response) => {
    try {
        const {
            hospitalId,
            time,
            ot,
            patientRoom,
            procedure,
            remarks,
            surgeon,
            nurse_team,
            anaesthesiologist,
            anaesthesiaType,
            scrub,
            circulatory,
            patientUsername,
            patientName,
            date,
            hospitalName,
            type,
            prescipDoctor,
            performingDoc,
            doctorUsername,
            note,
            contents,
            file_path,
            uploaded_by,
            uploaded_At,
            downloaded_by,
            downloaded_at,
            status,
            equipment,
            anaesthesiaName,
            iv,
            bloodUnit,
            room,
            medicine,
        } = req.body;

        if (!hospitalId) {
            return res.status(400).json({
                success: true,
                message: "hospitalId field is missing !"
            })
        }
        const surgeryColl = await getCollection<ISurgery>("Surgeries", hospitalId?.toString());

        const surgery: ISurgery = {
            hospitalId,
            time: time || "",
            patientRoom: patientRoom || "",
            procedure: procedure || "",
            remarks: remarks || "",
            surgeon: surgeon || "",
            nurse_team: nurse_team || [],
            anaesthesiologist: anaesthesiologist || "",
            anaesthesiaType: anaesthesiaType || "",
            scrub: scrub || "",
            circulatory: circulatory || "",
            patientUsername: patientUsername || "",
            patientName: patientName || "",
            date: date || "",
            hospitalName: hospitalName || "",
            type: type || TYPE.SURGERY,
            prescipDoctor: prescipDoctor || "",
            performingDoc: performingDoc || [],
            doctorUsername: doctorUsername || "",
            note: note || "",
            contents: contents as ITestResult[],
            file_path: file_path || "",
            uploaded_by: uploaded_by || "",
            uploaded_At: uploaded_At || "",
            downloaded_by: downloaded_by || [],
            downloaded_at: downloaded_at || [],
            status: STATUS.SCHEDULED,
            equipment: equipment || [],
            anaesthesiaName: anaesthesiaName || [],
            iv: iv || [],
            bloodUnit: bloodUnit || "",
            room: room || {
                type: roomType.SURGICAL,
                roomNumber: 0,
                Beds: {
                    id: "",
                    number: 0
                },
                numberOfBeds: 0
            },
            medicine: medicine || []
        }
        const result = await surgeryColl.insertOne(surgery);
        return res.status(201).json({
            success: true,
            message: "Surgery added successfully.",
            data: result
        })
    } catch (error: any) {
        console.error("Error in adding surgery", error)
        return res.status(500).json({
            success: false,
            message: "Error in adding surgery"
        })
    }
}

export const updateSurgery = async (req: Request, res: Response) => {
    try {
        const { hospitalId, id } = req.query;
        const checkHospitalId = hospitalId?.toString().substring(0, 3);
        if (checkHospitalId !== "hos") {
            if (!hospitalId || !id) {
                return res.status(400).json({
                    success: true,
                    message: "hospitalId or document id field is missing in query parameters !"
                })
            }
        }
        const mongoId = new ObjectId(id as string);
        const updatedSurgery = req.body;
        const surgeryColl = await getCollection<ISurgery>("Surgeries", hospitalId?.toString());
        const updateResult = await surgeryColl.findOneAndUpdate(
            { _id: mongoId },
            { $set: updatedSurgery, ...updateSurgery },
            { returnDocument: "after" }
        );

        if (!updateResult) {
            return res.status(404).json({
                success: true,
                message: "Surgery not found."
            })
        }

        return res.status(201).json({
            success: true,
            message: "Surgery updated successfully.",
            data: updateResult
        })


    } catch (error: any) {
        console.error("Error in updating surgery", error)
        return res.status(500).json({
            success: false,
            message: "Error in updating surgery"
        })
    }
}

export const deleteSurgery = async (req: Request, res: Response) => {
    try {
        const { hospitalId, id } = req.query;

        if (!hospitalId || !id) {
            return res.status(400).json({
                success: true,
                message: "hospitalId or document id field is missing in query parameters !"
            })
        }
        const mongoId = new ObjectId(id as string);
        const surgeryColl = await getCollection<ISurgery>("Surgeries", hospitalId?.toString());
        const deleteResult = await surgeryColl.findOneAndDelete({ _id: mongoId });
        if (deleteResult) {
            return res.status(201).json({
                success: true,
                message: "Surgery deleted successfully.",
                data: deleteResult
            })
        } else {
            return res.status(404).json({
                success: true,
                message: "Surgery not found."
            })
        }
    } catch (error: any) {
        console.error("Error in deleting surgery", error)
        return res.status(500).json({
            success: false,
            message: "Error in deleting surgery"
        })
    }
}

export const getRoomFromIpd = async (req: Request, res: Response) => {
    try {
        const { hospitalId, patientUsername, id } = req.query;
        const surgeryColl = await getCollection<IIPD>("IPDList", hospitalId?.toString());
        const ipd = await surgeryColl.findOne({ _id: new ObjectId(id as string) });
        if (!ipd) {
            return res.status(404).json({
                success: true,
                message: "Room not found."
            })
        }
        const room = {
            type: ipd.room.type,
            roomNumber: ipd.room.roomNumber,
            Beds: ipd.room.Beds,
            numberOfBeds: ipd.room.numberOfBeds
        }
        if (room) {
            return res.status(200).json({
                success: true,
                message: "Room fetched successfully.",
                data: room
            })
        } else {
            return res.status(404).json({
                success: true,
                message: "Room not found."
            })
        }
    } catch (error: any) {
        console.error("Error in getting room from ipd", error)
        return res.status(500).json({
            success: false,
            message: "Error in getting room from ipd"
        })
    }
}

export const getEquipment = async (req: Request, res: Response) => {
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
        const equipmentColl = await getCollection<IEquipment>("EquipmentList", hospitalId?.toString());
        const equipment = await equipmentColl.find().skip(lowerLimit).limit(limit).toArray();
        if (equipment) {
            return res.status(200).json({
                success: true,
                message: "Equipment fetched successfully.",
                data: equipment
            })
        } else {
            return res.status(404).json({
                success: true,
                message: "Equipment not found."
            })
        }
    } catch (error: any) {
        console.error("Error in getting equipment", error)
        return res.status(500).json({
            success: false,
            message: "Error in getting equipment"
        })
    }
}

export const getMedicines = async (req: Request, res: Response) => {
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
        const itemColl = await getCollection<IItem>("Item", hospitalId?.toString());
        const medicines = await itemColl.find({
            itemType: ITEMTYPE.MEDICINE
        }).skip(lowerLimit).limit(limit).toArray();
        if (medicines) {
            return res.status(200).json({
                success: true,
                message: "Medicines fetched successfully.",
                data: medicines
            })
        }
        else {
            return res.status(404).json({
                success: true,
                message: "Medicines not found."
            })
        }
    } catch (error: any) {
        console.error("Error in getting medicines", error)
        return res.status(500).json({
            success: false,
            message: "Error in getting medicines"
        })
    }
}

export const addNurseToTeam = async (req: Request, res: Response) => {
    try {
        const { hospitalId, id } = req.query;
        const mongoId = new ObjectId(id as string);
        const { nurse } = req.body;
        const surgeryColl = await getCollection<ISurgery>("Surgeries", hospitalId?.toString());
        const updateResult = await surgeryColl.findOneAndUpdate(
            { _id: mongoId },
            { $push: { nurse_team: nurse } },
            { returnDocument: "after" }
        );
        if (updateResult) {
            return res.status(201).json({
                success: true,
                message: "Nurse added to team successfully.",
                data: updateResult
            })
        } else {
            return res.status(404).json({
                success: true,
                message: "Surgery not found."
            })
        }
    } catch (error: any) {
        console.error("Error in adding nurse to team", error)
        return res.status(500).json({
            success: false,
            message: "Error in adding nurse to team"
        })
    }
}

export const addMedicinesToSurgery = async (req: Request, res: Response) => {
    try {
        const { hospitalId, id, quantity, surgeryId } = req.query;
        const mongoId = new ObjectId(id as string);
        const medicineColl = await getCollection<IItem>("Item", hospitalId?.toString());
        const medicine = await medicineColl.findOne({
            _id: mongoId
        });
        const quantityInt = medicine?.quantity;
        if ((quantityInt ?? 0) - parseInt(quantity?.toString() || "0") < 0) {
            return res.status(400).json({
                success: true,
                message: "Quantity of medicine is not available."
            })
        }
        let sId = new ObjectId(surgeryId as string);
        if (medicine) {
            const updateResult = await medicineColl.findOneAndUpdate(
                { _id: mongoId },
                { $set: { quantity: medicine.quantity - parseInt(quantity?.toString() || "0") } },
                { returnDocument: "after" }
            );
            const addMedicineToSurgery = await getCollection<ISurgery>("Surgeries", hospitalId?.toString());
            await addMedicineToSurgery.findOneAndUpdate(
                { _id: sId },
                { $push: { medicine: { medicineName: medicine.name, quantity: parseInt(quantity?.toString() || "0") } } },
                { returnDocument: "after" }
            );
            if (updateResult) {
                return res.status(201).json({
                    success: true,
                    message: "Medicines added to surgery successfully.",
                    data: updateResult
                })
            } else {
                return res.status(404).json({
                    success: true,
                    message: "Medicines not found."
                })
            }
        } else {
            return res.status(404).json({
                success: true,
                message: "Medicines not found."
            })
        }
    } catch (error: any) {
        console.error("Error in adding medicines to surgery", error)
        return res.status(500).json({
            success: false,
            message: "Error in adding medicines to surgery"
        })
    }
}

// at the same the time equipment is also update the issued to and on 
export const addEquipmentToSurgery = async (req: Request, res: Response) => {
    try {
        const { hospitalId, id, quantity, surgeryId } = req.query;
        console.log("Received parameters:", { hospitalId, id, quantity, surgeryId });

        if (!hospitalId || !id || !quantity || !surgeryId) {
            return res.status(400).json({
                success: false,
                message: "Missing required parameters"
            });
        }

        const mongoId = new ObjectId(id as string);
        const sId = new ObjectId(surgeryId as string);

        const equipmentColl = await getCollection<IEquipment>("EquipmentList", hospitalId.toString());
        const equipment = await equipmentColl.findOne({ _id: mongoId });

        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: "Equipment not found."
            });
        }

        console.log("Found equipment:", equipment);

        const quantityToAdd = parseInt(quantity.toString());
        if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid quantity."
            });
        }

        if (equipment.quantity - quantityToAdd < 0) {
            return res.status(400).json({
                success: false,
                message: "Insufficient equipment quantity available."
            });
        }

        const equipmentObject = {
            equipmentId: mongoId.toString(),
            equipmentName: equipment.name,
            quantity: quantityToAdd,
            status: "Booked"
        };

        const surgeryColl = await getCollection<ISurgery>("Surgeries", hospitalId.toString());

        // First, check if the surgery exists
        const surgeryExists = await surgeryColl.findOne({ _id: sId });
        if (!surgeryExists) {
            return res.status(404).json({
                success: false,
                message: "Surgery not found."
            });
        }

        console.log("Attempting to update surgery:", sId);
        const updateSurgeryResult = await surgeryColl.findOneAndUpdate(
            { _id: sId },
            { $push: { equipment: equipmentObject } },
            { returnDocument: "after" }
        );

        if (!updateSurgeryResult) {
            console.error("Failed to update surgery:", sId);
            return res.status(500).json({
                success: false,
                message: "Failed to add equipment to surgery."
            });
        }

        console.log("Successfully updated surgery. Updating equipment quantity.");
        const updateEquipmentResult = await equipmentColl.findOneAndUpdate(
            { _id: mongoId },
            {
                $set: {
                    quantity: equipment.quantity - quantityToAdd,
                    issuedTo: sId.toString(),
                    issuedOn: new Date(),
                }
            },
            { returnDocument: "after" }
        );

        if (!updateEquipmentResult) {
            console.error("Failed to update equipment:", mongoId);
            // Rollback the surgery update
            await surgeryColl.findOneAndUpdate(
                { _id: sId },
                { $pull: { equipment: equipmentObject } }
            );
            return res.status(500).json({
                success: false,
                message: "Failed to update equipment quantity."
            });
        }

        console.log("Operation completed successfully");
        return res.status(201).json({
            success: true,
            message: "Equipment added to surgery successfully.",
            data: updateEquipmentResult
        });

    } catch (error: any) {
        console.error("Error in adding equipment to surgery:", error);
        return res.status(500).json({
            success: false,
            message: "Error in adding equipment to surgery",
            error: error.message
        });
    }
}

export const addIVToSurgery = async (req: Request, res: Response) => {
    try {
        const { hospitalId, id } = req.query;
        const mongoId = new ObjectId(id as string);
        const {
            ivName,
            ivId,
            nurse,
            witnessDoctor,
            pharmacist,
            dosage,
            time,
            date,
            notes
        } = req.body;

        if (!hospitalId || !id) {
            return res.status(400).json({
                success: true,
                message: "hospitalId or document id field is missing"
            });
        }

        const surgeryColl = await getCollection<ISurgery>("Surgeries", hospitalId?.toString());

        const newIV: iv = {
            ivName: ivName || "",
            ivId,
            nurse,
            witnessDoctor,
            pharmacist,
            dosage: dosage || "",
            time,
            date,
            notes
        }

        const updateResult = await surgeryColl.findOneAndUpdate(
            { _id: mongoId },
            {
                $push: { iv: newIV }
            },
            { returnDocument: "after" }
        );

        if (!updateResult) {
            return res.status(404).json({
                success: true,
                message: "Surgery not found."
            })
        }

        return res.status(201).json({
            success: true,
            message: "IV added to surgery successfully.",
            data: updateResult
        });
    } catch (error: any) {
        console.error("Error in adding IV to surgery", error);
        return res.status(500).json({
            success: false,
            message: "Error in adding IV to surgery"
        });
    }
}

// notes of surgery controller  

export const showSurgeryPatientIntoIpd = async (req: Request, res: Response) => { }


// export const addAnesthesia = async(req:Request , res:Response) =>{
//      try{
//         const { surgeryId, anaesthesiaDetails } = req.body;
//         const {hospitalId} = req.query;
//         //doubt :---> surgery id req ki body me sei aayegi yaa params or query 

//       //anesthesiaDetails  is the object we are taking from the req ki body
//         if (!hospitalId || !surgeryId || !anaesthesiaDetails) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Missing required fields: hospitalId, surgeryId, or anaesthesiaDetails",
//             });
//         }

//         if (!ObjectId.isValid(surgeryId)) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid surgeryId format",
//             });
//         }

//         // const surgeryObjectId = new ObjectId(surgeryId);

//         const surgeryColl = await getCollection<ISurgery>("Surgeries", hospitalId?.toString());
//         const surgery = await surgeryColl.findOne({ _id: surgeryId });

//         if (!surgery) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Surgery not found.",
//             });
//         }

//         const newAnesthesia: anaesthesiaName = {
//             anaesthesiaName: anaesthesiaDetails.anaesthesiaName,
//             anaesthesiaId: new ObjectId().toString(),
//             nurse: anaesthesiaDetails.nurse,
//             witnessDoctor: anaesthesiaDetails.witnessDoctor,
//             pharmacist: anaesthesiaDetails.pharmacist,
//             dosage: anaesthesiaDetails.dosage,
//             time: anaesthesiaDetails.time,
//             notes: anaesthesiaDetails.notes,
//         };


//         await surgeryColl.updateOne(
//             { _id: surgeryId },
//             { $push: { anaesthesiaName: newAnesthesia } }
//         );

//         return res.status(200).json({
//             success: true,
//             message: "Anesthesia added successfully.",
//         });

//      }catch(error){
//      console.error("Error in adding anesthesia to surgery", error);
//      return res.status(500).json({
//          success: false,
//          message: "Error in adding anesthesia to surgery"
//      });
//      }
//}
export const addAnaesthesia = async (req: Request, res: Response) => {
    try {
        const { hospitalId, id } = req.query;
        const mongoId = new ObjectId(id as string);
        const { anaesthesiaName, anaesthesiaId, nurse, witnessDoctor, pharmacist, dosage, time, date, notes } = req.body;


        console.log(anaesthesiaName, anaesthesiaId, nurse, witnessDoctor, pharmacist, dosage, time, notes);

        if (!hospitalId || !id) {
            return res.status(400).json({
                success: true,
                message: "hospitalId or document id field is missing"
            });
        }

        const anaesthesiaColl = await getCollection<ISurgery>("Surgeries", hospitalId?.toString());
        const newAnaesthesia: anaesthesiaName = {
            anaesthesiaName: anaesthesiaName || "",
            anaesthesiaId,
            nurse,
            witnessDoctor,
            pharmacist,
            dosage: dosage || "",
            time,
            date,
            notes
        }

        const updateResult = await anaesthesiaColl.findOneAndUpdate(
            { _id: mongoId },
            {
                $push: { anaesthesiaName: newAnaesthesia }
            },
            { returnDocument: "after" }
        );

        if (!updateResult) {
            return res.status(404).json({
                success: true,
                message: "Surgery not found."
            })
        }

        return res.status(201).json({
            success: true,
            message: "Anaesthesia added to surgery successfully.",
            data: updateResult
        });
    } catch (error: any) {
        console.error("Error in adding anaesthesia to surgery", error);
        return res.status(500).json({
            success: false,
            message: "Error in adding anaesthesia to surgery"
        });
    }
}

export const updateAnaesthesia = async (req: Request, res: Response) => {
    try {
        const { hospitalId, id, anaesthesiaId } = req.query;
        const mongoId = new ObjectId(id as string);

        const SurgeriesColl = await getCollection<ISurgery>("Surgeries", hospitalId?.toString());
        const Surgeries = await SurgeriesColl.findOne({ _id: mongoId });

        if (!Surgeries) {
            return res.status(404).json({
                success: false,
                message: "Surgeries not found",
            });
        }

        const { anaesthesiaName } = Surgeries;
        const anaesthesiaIndex = anaesthesiaName.findIndex(anaesthesia => anaesthesia.anaesthesiaId === anaesthesiaId);

        console.log(anaesthesiaIndex)

        if (anaesthesiaIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "anaesthesia not found",
            });
        }

        const newAnaesthesia = req.body;

        const currentAnaesthesia = anaesthesiaName[anaesthesiaIndex];

        console.log(currentAnaesthesia.date)

        if (isExpired(currentAnaesthesia.date, currentAnaesthesia.time, 5)) {
            return res.status(404).json({
                success: true,
                message: "Updation time expired !"
            })
        }

        const updatedAnaesthesia: anaesthesiaName = {
            anaesthesiaName: newAnaesthesia?.anaesthesiaName || currentAnaesthesia?.anaesthesiaName,
            anaesthesiaId: currentAnaesthesia.anaesthesiaId,
            nurse: {
                nurseName: newAnaesthesia?.nurse?.nurseName || currentAnaesthesia?.nurse?.nurseName,
                nurseId: newAnaesthesia?.nurse?.nurseId || currentAnaesthesia?.nurse?.nurseId
            },
            witnessDoctor: {
                witnessName: newAnaesthesia?.witnessDoctor?.witnessName || currentAnaesthesia?.witnessDoctor?.witnessName,
                witnessId: newAnaesthesia?.witnessDoctor?.witnessId || currentAnaesthesia?.witnessDoctor?.witnessId
            },
            pharmacist: {
                pharmacistName: newAnaesthesia?.pharmacist?.pharmacistName || currentAnaesthesia?.pharmacist?.pharmacistName,
                pharmacistId: newAnaesthesia?.pharmacist?.pharmacistId || currentAnaesthesia?.pharmacist?.pharmacistId,
            },
            dosage: newAnaesthesia?.dosage || currentAnaesthesia.dosage,
            time: newAnaesthesia?.time ?? currentAnaesthesia.time,
            date: newAnaesthesia?.date ?? currentAnaesthesia.date,
            notes: newAnaesthesia?.notes ?? currentAnaesthesia.notes,
        }

        anaesthesiaName[anaesthesiaIndex] = { ...updatedAnaesthesia };

        const result = await SurgeriesColl.findOneAndUpdate(
            { _id: mongoId },
            { $set: { anaesthesiaName } },
            { returnDocument: "after" }
        );

        return res.status(200).json({
            success: true,
            message: "Anaesthesia record updated successfully",
            data: result,
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

export const updateIV = async (req: Request, res: Response) => {
    try {
        const { hospitalId, id, ivId } = req.query;
        const mongoId = new ObjectId(id as string);

        const surgeryColl = await getCollection<ISurgery>("Surgeries", hospitalId?.toString());
        const Surgeries = await surgeryColl.findOne({ _id: mongoId });

        if (!Surgeries) {
            return res.status(404).json({
                success: false,
                message: "Surgeries not found",
            });
        }

        const iv = Surgeries.iv;
        const ivIndex = iv.findIndex(iv => iv.ivId === ivId);

        if (ivIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "IV not found",
            });
        }

        const data = req.body;

        const currentIV = iv[ivIndex];

        if (isExpired(currentIV.date, currentIV.time, 5)) {
            return res.status(404).json({
                success: true,
                message: "Updation time expired !"
            })
        }

        const updatedIV: iv = {
            ivName: data?.ivName || currentIV?.ivName,
            ivId: currentIV.ivId,
            nurse: {
                nurseName: data?.nurse?.nurseName || currentIV?.nurse?.nurseName,
                nurseId: data?.nurse?.nurseId || currentIV?.nurse?.nurseId
            },
            witnessDoctor: {
                witnessName: data?.witnessDoctor?.witnessName || currentIV?.witnessDoctor?.witnessName,
                witnessId: data?.witnessDoctor?.witnessId || currentIV?.witnessDoctor?.witnessId
            },
            pharmacist: {
                pharmacistName: data?.pharmacist?.pharmacistName || currentIV?.pharmacist?.pharmacistName,
                pharmacistId: data?.pharmacist?.pharmacistId || currentIV?.pharmacist?.pharmacistId,
            },
            dosage: data?.dosage || currentIV.dosage,
            time: data?.time || currentIV.time,
            date: data?.date || currentIV.date,
            notes: data?.notes ?? currentIV.notes,
        }

        iv[ivIndex] = { ...updatedIV };

        const result = await surgeryColl.findOneAndUpdate(
            { _id: mongoId },
            { $set: { iv } },
            { returnDocument: "after" }
        );

        return res.status(200).json({
            success: true,
            message: "IV record updated successfully",
            data: result,
        });
    } catch (error: any) {
        console.log("error in updating IV record ", error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};