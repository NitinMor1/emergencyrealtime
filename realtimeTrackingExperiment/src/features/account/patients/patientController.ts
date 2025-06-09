import { Request, Response } from "express";
import { IPatient, Vitals } from "./PatientModel";
import { getCollection } from "../../../db/db";
import { getPatientUsername } from "../users/user_ctrlfunc";
import { createHash } from "crypto";
import { ObjectId } from "mongodb";
import { IHospital } from "features/auth/HospitalModel";
import { isValidObjectId } from "mongoose";

export function hash(input: string): string {
    return createHash('sha256').update(input).digest('hex').substring(0, 16);
}
export const addPatientInfo = async (req: Request, res: Response) => {
    try {
        let {
            hospitalId,
            officeId,
            patientId,
            username,
            email,
            name,
            age,
            gender,
            password,
            patientGrowth,
            bloodGroup,
            address,
            pincode,
            phoneNumber,
            secondaryPhoneNumber,
            dob,
            group,
            flag,
            familyHistory,
            parentsDetails,
            allergies,
            additionalNotes,
            preTermDays,
            referredBy,
            school,
            family,
            vitals,
            profileUrl,
            personalHealth,
            patientVaccination,
        }: IPatient = req.body;
        if (!name || !age) {
            return res.status(400).json({
                success: true,
                message: "Name and age are required"
            })
        }
        const findUhid = await getCollection<IHospital>("Hospitals", null);
        const hospital = await findUhid.findOne({
            hospitalId: hospitalId?.toString()
        });
        let uhidNumber = hospital?.uhidNumber || 0;
        uhidNumber += 1;
        const userName = getPatientUsername(name, phoneNumber);
        const newPatient: IPatient = {
            hospitalId: hospitalId?.toString(),
            officeId: `o_${hospitalId}_${officeId}` || `o_${hospitalId}_${uhidNumber}`,
            patientId: `p_${hash(`${name}+${phoneNumber}`)}`,
            username: userName || username,
            email: email || "",
            name: name || "",
            age: age || 0,
            gender: gender || "",
            password: password || "",
            patientGrowth: patientGrowth || [],
            bloodGroup: bloodGroup || "",
            address: address || "",
            pincode: pincode || "",
            phoneNumber: phoneNumber || "",
            secondaryPhoneNumber: secondaryPhoneNumber || "",
            dob: dob || new Date(),
            group: group || "",
            flag: flag || "",
            familyHistory: familyHistory || "",
            parentsDetails: parentsDetails || {
                motherHeight: 0,
                motherName: "",
                motherProfession: "",
                fatherHeight: 0,
                fatherName: "",
                fatherProfession: "",
            },
            allergies: allergies || "",
            additionalNotes: additionalNotes || "",
            preTermDays: preTermDays || 0,
            referredBy: referredBy || "",
            school: school || "",
            family: family || [],
            vitals: vitals || [],
            listOfHospitals: [hospitalId?.toString()],
            listOfDoctors: [],
            profileUrl: profileUrl || "",
            personalHealth: personalHealth || null,
            patientVaccination: patientVaccination || [],
        };
        let patient;
        const patientColl = await getCollection<IPatient>("PatientList", null);
        const findPatient = await patientColl.findOne({
            name,
            phoneNumber,
            dob,
        });

        if (findPatient && !findPatient.listOfHospitals.includes(hospitalId?.toString())) {
            // Add hospitalId to the list
            await patientColl.updateOne(
                { _id: findPatient._id },
                { $addToSet: { listOfHospitals: hospitalId?.toString() } }
            );
        } else if (!findPatient) {
            // Insert new patient
            patient = await patientColl.insertOne(newPatient);

            // search for the hospital and increment uhidNumber by 1

            const hospitalColl = await getCollection<IHospital>("Hospitals", null);
            const hospital = await hospitalColl.findOne({
                hospitalId: hospitalId
            });
            // increment uhidNumber by 1
            if (hospital) {
                const updatedHospital = await hospitalColl.updateOne(
                    { hospitalId: hospitalId },
                    { $inc: { uhidNumber: 1 } }
                );
                if (updatedHospital.modifiedCount === 0) {
                    return res.status(500).json({
                        success: false,
                        message: "Error in updating uhidNumber"
                    });
                }
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Hospital not found"
                });
            }

        }
        return res.status(201).json({
            success: true,
            message: "Patient added successfully",
            data: patient,
        })
    } catch (error) {
        console.error("Error adding patient:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export const getPatientInfoById = async (req: Request, res: Response) => {
    try {
        const { hospitalId, username } = req.query;
        const patientColl = await getCollection<IPatient>("PatientList", null);

        const query = {
            username: username?.toString(),
            listOfHospitals: { $in: [hospitalId?.toString() || ""] }
        };
        const patientDetails = await patientColl.findOne(query);
        if (!patientDetails) {
            return res.status(404).json({
                success: false,
                message: "Patient details not found"
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "Patient details fetched successfully",
                data: patientDetails
            });
        }
    } catch (error) {
        console.error("Error in fetching patient details:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export const getAllPatients = async (req: Request, res: Response) => {
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
        const patientColl = await getCollection<IPatient>("PatientList", null);
        // Corrected query
        const allPatients = await patientColl.find({
            listOfHospitals: { $in: [hospitalId?.toString()] as string[] }
        }).skip(lowerLimit).limit(limit).toArray();
        if (allPatients.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No patients found"
            });
        }
        res.status(200).json({
            success: true,
            message: "All patients fetched successfully",
            data: allPatients,
        });
    } catch (error) {
        console.error("Error in fetching all patients:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

// need to test this route
export const updatePatientInfo = async (req: Request, res: Response) => {
    try {
        const { hospitalId, patientId } = req.query;
        const patientColl = await getCollection<IPatient>("PatientList", null);
        const previousDetails = await patientColl.findOne({
            patientId: patientId?.toString(),
            listOfHospitals: { $in: [hospitalId?.toString()] as string[] }
        })
        const {
            email,
            name,
            age,
            gender,
            bloodGroup,
            address,
            pincode,
            phoneNumber,
            secondaryPhoneNumber,
            dob,
            group,
            flag,
            familyHistory,
            parentsDetails,
            allergies,
            additionalNotes,
            preTermDays,
            referredBy,
            school,
            personalHealth,
        } = req.body;


        const updatedPatient = {
            hospitalId: hospitalId?.toString(),
            email,
            name,
            age,
            gender,
            bloodGroup,
            address,
            pincode,
            phoneNumber,
            secondaryPhoneNumber,
            dob,
            group,
            flag,
            familyHistory,
            parentsDetails,
            allergies,
            additionalNotes,
            preTermDays,
            referredBy,
            school,
            personalHealth,

        };

        // Corrected query and update operation
        const patientDetails = await patientColl.findOneAndUpdate(
            {
                patientId: patientId?.toString(),
                listOfHospitals: { $in: [hospitalId?.toString() || ""] }
            },
            { $set: { ...previousDetails, updatedPatient } },
            { returnDocument: 'after' } // This ensures we get the updated document
        );

        if (!patientDetails) {
            return res.status(404).json({
                success: false,
                message: "Patient details not found"
            });
        } else {
            res.status(200).json({
                success: true,
                message: "Patient details updated successfully",
                data: patientDetails
            });
        }
    } catch (error) {
        console.error("Error in updating patient details:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}


export const updatePatientVitals = async (req: Request, res: Response) => {
    try {
        const { hospitalId, patientId, date, Time } = req.query;
        if (!patientId || !date || !Time) {
            return res.status(400).json({
                success: false,
                message: "PatientId, date and Time are required",
            });
        }
        const {
            patientUsername,
            patientOfficeId,
            note,
            status,
            unit,
            value,
            vitalId,
            vitalName,
        } = req.body;
        const vitalsCollection = await getCollection<IPatient>('PatientList', null);
        const newVitals: Vitals = {
            patientUsername: patientUsername?.toString(),
            patientOfficeId: patientOfficeId?.toString(),
            date: date?.toString() || new Date(),
            time: Time?.toString(),
            note: note?.toString(),
            status: status?.toString(),
            unit: unit?.toString(),
            value: value?.toString(),
            vitalId: vitalId?.toString(),
            vitalName: vitalName?.toString(),
        };
        const findPatient = await vitalsCollection.findOne({
            patientId: patientId?.toString(),
            listOfHospitals: { $in: [hospitalId?.toString()] as string[] }
        });
        if (!findPatient) {
            return res.status(404).json({
                success: true,
                message: "Patient not found"
            });
        }
        const findVitals = findPatient.vitals.find((vital) => vital.date === date && vital.time === Time);
        if (!findVitals) {
            return res.status(404).json({
                success: true,
                message: "Vitals not found"
            });
        }
        const result = await vitalsCollection.updateOne({
            patientId: patientId?.toString(),
            listOfHospitals: { $in: [hospitalId?.toString()] as string[] },
            "vitals.date": date,
            "vitals.time": Time
        }, {
            $set: {
                "vitals.$": newVitals
            }
        });
        if (result.modifiedCount === 0) {
            return res.status(404).json({
                success: true,
                message: "Vitals not updated"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Vitals updated successfully"
        });
    } catch (error: any) {
        console.error("Error in updating patient vitals", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
};


export const getPatientsBySearch = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 50, search, hospitalId } = req.query;

        const pageInt = parseInt(page.toString());
        const limitInt = parseInt(limit.toString());

        const patientColl = await getCollection<IPatient>("PatientList", null);

        const filter: any = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search.toString(), $options: "i" } },
                { phoneNumber: { $regex: search.toString(), $options: "i" } },
                { secondaryPhoneNumber: { $regex: search.toString(), $options: "i" } },
                { patientId: { $regex: search.toString(), $options: "i" } }
            ];
        }

        if (hospitalId) {
            filter.listOfHospitals = { $in: [hospitalId.toString()] };
        }

        const patients = await patientColl.find(filter).limit(limitInt).skip((pageInt - 1) * limitInt).toArray();

        if (patients.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No patients found!"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Patients retrieved successfully",
            data: patients,
            dataCount: patients.length
        });
    } catch (error) {
        console.error("Error while getting patients by search: ", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong!"
        });
    }
};

// new controller // in testing phase
export const getPatientsByMongoID = async (req: Request, res: Response) => {
    try {
        const { id } = req.query;

        if (!id || !isValidObjectId(id as string)) {
            return res.status(400).json({
                success: false,
                message: "MongoDB ID is either missing or invalid"
            });
        }
        const mongoId = new ObjectId(id.toString());

        const patientColl = await getCollection("PatientList", null);

        const patient = await patientColl.findOne({ _id: mongoId });

        if (!patient) {
            return res.status(404).json(
                {
                    success: false,
                    message: "patient not found"
                }
            )
        }

        return res.status(200).json(
            {
                success: true,
                message: "Patient fetched successfully",
                data: patient
            }
        )
    } catch (error) {
        console.error("Error while getting patient by MongoDB ID:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// export const checkIfUserNamePresent = async (req: Request, res: Response) =>{
//     try{
//         const patientColl = await getCollection<IPatient>("PatientList", null);
//         const patients = await patientColl.find({}).toArray();
//         const updatedPatients = [];
//         let counter = 1;
//         for(let patient of patients){
//             console.log(`Checking username for patient ${counter}`);
//             let newUsername = getPatientUsername(patient.name);
//             if(patients.map((p)=> p.username).includes(newUsername)){
//                 newUsername = getPatientUsername(patient.name);
//             }
//             patient.username = newUsername;
//             updatedPatients.push(patient);
//             counter++;
//         }
//         // update all patients with new username in one go
//         const deleteOldResult = await patientColl.deleteMany({});
//         const insertNewResult = await patientColl.insertMany(updatedPatients);
//         return res.status(200).json({
//             success: true,
//             message: "Username updated successfully"
//         });
//     }catch(error:any){
//     console.error("Error in checking and updating username:", error);
//     res.status(500).json({
//         success: false,
//         message: "Internal Server Error"
//     });
//     }
// }