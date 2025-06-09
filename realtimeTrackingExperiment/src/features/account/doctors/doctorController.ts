import { IDoctor, IModes } from './DoctorModel';
import { Request, Response } from 'express';
import { getCollection } from '../../../db/db';

export const getDoctor = async (req: Request, res: Response) => {
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
                message: "Invalid or missing hospitalId",
            });
        }

        const doctorColl = await getCollection<IDoctor>("DoctorList", null);
        const doctors: IDoctor[] = await doctorColl.find({
            listOfHospitals: hospitalId as string
        }).skip(lowerLimit).limit(limit).toArray();

        if (doctors.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No doctors found for the given hospital",
            });
        } else {
            return res.status(200).json({
                success: true,
                data: doctors,
            });
        }

    } catch (error: any) {
        console.error("Error getting doctors:", error);
        res.status(500).json({
            success: false,
            message: "Error getting doctors",
        });
    }
}

export const getDutySchedule = async (req: Request, res: Response) => {
    try {
        const { doctorUsername } = req.query;

        if (!doctorUsername) {
            return res.status(400).json(
                {
                    success: false,
                    message: "Doctor username is required !!"
                }
            )
        }

        const doctorColl = await getCollection<IDoctor>("DoctorList", null);
        const doctor = await doctorColl.findOne({ doctorUsername: doctorUsername.toString() })

        const schedule = doctor?.DutySchedule;

        if (!schedule) {
            return res.status(404).json(
                {
                    success: false,
                    message: "Schedule not found !!"
                }
            )
        }

        return res.status(200).json(
            {
                success: false,
                message: "Schedule fetched successfully.",
                data: {
                    ...(schedule.Sunday && { Sunday: schedule.Sunday }),
                    ...(schedule.Monday && { Monday: schedule.Monday }),
                    ...(schedule.Tuesday && { Tuesday: schedule.Tuesday }),
                    ...(schedule.Wednesday && { Wednesday: schedule.Wednesday }),
                    ...(schedule.Thursday && { Thursday: schedule.Thursday }),
                    ...(schedule.Friday && { Friday: schedule.Friday }),
                    ...(schedule.Saturday && { Saturday: schedule.Saturday })
                }
            }
        )

    } catch (error) {
        console.log("error in in getting duty schedule: ", error);
        return res.status(500).json(
            {
                success: false,
                message: "Internal Server Error"
            }
        )
    }
}

/*

export const updateDoctorDataWithNewModel = async (req: Request, res: Response) => {
    try {
        const doctorColl = await getCollection<IDoctor>("DoctorList", null);
        const doctors = await doctorColl.find({}).toArray();
        const updatedDoctors: IDoctor[] = [];
        let count = 0;
        
        for (let doctor of doctors) {
            // Handle the profile -> profilePicture field name change
            const profilePicture = doctor.profilePicture ?? (doctor as any).profile ?? null;
            
            // Handle mode conversion from string to enum
            let mode: IModes;
            if (typeof doctor.mode === 'string') {
                mode = doctor.mode === 'full-time' ? IModes.FULLTIME : IModes.PARTTIME;
            } else {
                mode = doctor.mode || IModes.FULLTIME; // default to full-time if not specified
            }
            
            const updatedDoctor: Partial<IDoctor> = {
                // Keep all existing fields
                ...doctor,
                
                // Handle field transformations and new fields
                profilePicture: profilePicture ? {
                    id: profilePicture.id ?? "",
                    url: profilePicture.url ?? "",
                } : {
                    id: "",
                    url: "",
                },
                
                // Convert mode to enum
                mode: mode,
                
                // Add new fields with defaults if they don't exist
                dutyTime:{
                        "Monday":[],
                        "Tuesday":[],
                        "Wednesday":[],
                        "Thursday":[],
                        "Friday":[],
                        "Saturday":[],
                        "Sunday":[],
                },
                supervisors: doctor.supervisors ?? [],
                subOrdinates: doctor.subOrdinates ?? [],
                signature: doctor.signature ?? "",
                
                // Ensure other fields have proper defaults
                about: doctor.about ?? "",
                toggle: doctor.toggle !== undefined ? doctor.toggle : false,
            };
            
            // Remove the old 'profile' field if it exists
            const updateFields = { ...updatedDoctor };
            delete (updateFields as any).profile;
            
            await doctorColl.updateOne(
                { _id: doctor._id },
                { 
                    $set: updateFields,
                    $unset: { profile: "" } // Remove the old profile field
                }
            );
            
            count++;
            updatedDoctors.push(updateFields as IDoctor);
        }
        
        res.status(200).json({
            success: true,
            message: `Updated ${count} doctors successfully`,
            data: updatedDoctors,
        });
        
    } catch (error: any) {
        console.error("Error updating doctor data:", error.message);
        res.status(500).json({
            success: false,
            message: "Error updating doctor data",
            error: error.message,
        });
    }
}
*/

/*
export const updateDutyOfDoctor = async (req: Request, res: Response) => {
    try{
        const {doctorId, day, hospitalId} =  req.body;
        if (!doctorId || !day) {
            return res.status(400).json({
                success: false,
                message: "doctorId and day are required",
            });
        }
        const doctorColl = await getCollection<IDoctor>("DoctorList", null);
        const doctor = await doctorColl.findOne({ _id: new ObjectId(doctorId) });
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found",
            });
        }
    }catch (error: any) {
        console.error("Error updating duty of doctor:", error.message);
        res.status(500).json({
            success: false,
            message: "Error updating duty of doctor",
            error: error.message,
        });
    }
}
*/