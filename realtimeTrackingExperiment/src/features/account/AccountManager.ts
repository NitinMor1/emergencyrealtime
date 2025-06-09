import { Request, Response } from "express";
import { getCollection } from "../../db/db";
import { EhospitalType, IHospital } from "../auth/HospitalModel";

export const updateAccount = async (req: Request, res: Response) => {
    try {
        const { hospitalId } = req.query;
        const hospitalColl = await getCollection<IHospital>("Hospitals", null);
        const {
            hospitalType,
            name,
            email,
            phoneNumber,
            address,
            ambulance,
            labs,
            room,
            depts,
            passkeys,
            roleAccess,
            appointmentPerSlot
        } = req.body;
        const data = await hospitalColl.findOne({hospitalId: hospitalId});
        const hospital = await hospitalColl.findOneAndUpdate({hospitalId: hospitalId}, {$set:
            {   hospitalType: hospitalType,
                name: name ?? data?.name,
                email: email ?? data?.email,
                phoneNumber: phoneNumber ?? data?.phoneNumber,
                address: address ?? data?.address,
                ambulance: ambulance ?? data?.ambulance,
                labs: labs ?? data?.labs,
                room: room ?? data?.room,
                depts: depts ?? data?.depts,
                passkeys: passkeys ?? data?.passkeys,
                roleAccess: roleAccess ?? data?.roleAccess,
                appointmentPerSlot: appointmentPerSlot ?? data?.appointmentPerSlot,
            }
        });
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found"
            })
        } else {
            return res.status(201).json({
                success: true,
                message: "Account details updated successfully"
            })
        }
    } catch (error: any) {
        console.log("Error in updating account details " + error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}

export const UpdateSpacings = async (req: Request, res: Response) => {
    try {
        const { hospitalId } = req.query;

        // Input validation
        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "Hospital ID is required"
            });
        }

        // Validate spacing data
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Spacing data is required"
            });
        }

        // Get collection only once and cache it if possible
        const hospitalColl = await getCollection<IHospital>("Hospitals", null);

        // Use projection to only return necessary fields
        const hospital = await hospitalColl.findOneAndUpdate(
            { hospitalId },
            { $set: { spacings: req.body } },
            {
                returnDocument: "after",
                projection: { spacings: 1 } // Only return the spacings field
            }
        );
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found"
            });
        }

        // Use debug level logging instead of console.log
        if (process.env.NODE_ENV !== 'production') {
            console.debug("Updated spacings:", hospital);
        }

        return res.status(200).json({
            success: true,
            message: "Spacing settings updated successfully",
            data: hospital.spacings
        });
    } catch (error: any) {
        console.error("Error in updating spacing settings:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export const getUhidNumber = async (req: Request, res: Response) => {
    try {
        const { hospitalId } = req.query;

        // Input validation
        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "Hospital ID is required"
            });
        }

        // Get collection and find hospital in one step with projection
        const hospitalColl = await getCollection<IHospital>("Hospitals", null);
        const hospital = await hospitalColl.findOne(
            { hospitalId },
            { projection: { uhidNumber: 1 } }  // Only fetch the required field
        );

        // Combined null check for both hospital and uhidNumber
        if (!hospital?.uhidNumber) {
            return res.status(404).json({
                success: false,
                message: hospital ? "UHID number not found" : "Hospital not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "UHID number fetched successfully",
            data: hospital.uhidNumber
        });

    } catch (error) {
        // Proper error handling
        console.error('Error fetching UHID number:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const SetUhidNumber = async (req: Request, res: Response) => {
    try {
        const { hospitalId, uhid } = req.query;

        // Input validation
        if (!hospitalId || !uhid) {
            return res.status(400).json({
                success: false,
                message: "Hospital ID and UHID are required"
            });
        }

        // Safely convert uhid to number using a more efficient approach
        const uhidNumber = +(Array.isArray(uhid) ? uhid[0] : uhid);

        if (!Number.isFinite(uhidNumber)) {
            return res.status(400).json({
                success: false,
                message: "Invalid UHID number"
            });
        }

        const hospitalColl = await getCollection<IHospital>("Hospitals", null);

        // Use findOneAndUpdate with returnDocument option and projection
        const hospital = await hospitalColl.findOneAndUpdate(
            { hospitalId },
            { $set: { uhidNumber } },
            {
                returnDocument: 'after',
                projection: { uhidNumber: 1 }  // Only return the needed field
            }
        );

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "UHID number updated successfully",
            data: hospital.uhidNumber
        });

    } catch (error) {
        // Improved error logging
        console.error("Error in updating UHID number:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error while updating UHID number"
        });
    }
};


export const updateHospitalDetailsAccordingToNewModel = async (req: Request, res: Response) => {
    try{
        const hospitalColl = await getCollection<IHospital>("Hospitals", null);
        const hospitals = await hospitalColl.find({}).toArray();
        if(!hospitals || hospitals.length === 0){
            return res.status(404).json({
                success: false,
                message: "No hospitals found"
            })
        }
        const unableToUpdateHospitals = [];
        let count = 0;
        for(let hospital of hospitals){
            const newHospitalDetails:IHospital = {
                hospitalId: hospital.hospitalId,
                hospitalType: hospital.hospitalType?? EhospitalType.HOSPITAL,
                name: hospital.name,
                email: hospital.email,
                phoneNumber: hospital.phoneNumber,
                address: hospital.address,
                password: hospital.password,
                ambulance: hospital.ambulance,
                labs: hospital.labs,
                room: hospital.room,
                depts: hospital.depts,
                passkeys: hospital.passkeys,
                roleAccess: ["Accounts", "Staff", "Finance", "Dashboard", "Emergency", "OPD", "Equipments", "IPD", "Messages", "Surgery Schedule", "Inventory", "Labs/Scans"],
                ratePerBill: hospital.ratePerBill ?? {
                    ratePerOpdBill: 10,
                    ratePerIpdBill: 10,
                    ratePerTestBill: 10,
                },
                wallet: hospital.wallet,
                location: hospital.location ?? {
                    latitude: 22.1234,
                    longitude: 78.1234,
                    accuracy: 10,
                },
                loginDistance: hospital.loginDistance ?? 500,
                Images: hospital.Images ?? {
                    hospitalLogo: "",
                    headerImage: "",
                    footerImage: "",
                },
                uhidNumber: hospital.uhidNumber ?? 0,
                spacings: hospital.spacings ?? {
                    A4: {
                        headerSpacing: 10,
                        footerSpacing: 10,
                        leftSpacing: 10,
                        rightSpacing: 10,
                    },
                    DL: {
                        headerSpacing: 10,
                        footerSpacing: 10,
                        leftSpacing: 10,
                        rightSpacing: 10,
                    }
                },
                colors: {
                            "primaryColor": "0xFF365B6D",
                            "secondaryColor": "0xFFECF9F8",
                            "accentColor": "0xFFC4ECEA",
                            "backgroundColor": "0xFFFFFFFF"
                        },
                discount: hospital.discount ?? {
                    opdDiscount: {
                        VisitCount: 100,
                        Discount: 10,
                        freeOpdInterval: 7
                    }
                },
                appointmentPerSlot: hospital.appointmentPerSlot ?? 25,
            }
            const updatedHospital = await hospitalColl.findOneAndUpdate({
                hospitalId: hospital.hospitalId
            }, {
                $set: newHospitalDetails
            }, {
                returnDocument: "after"
            });
            if(!updatedHospital){
                unableToUpdateHospitals.push(hospital.hospitalId);
            }
            else{
                count++;
                console.log("Updated hospital details for hospitalId: " + hospital.hospitalId);
            }
        }
        if(unableToUpdateHospitals.length > 0){
            return res.status(500).json({
                success: false,
                message: "Unable to update hospital details for the following hospitals: " + unableToUpdateHospitals.join(", ")
            })
        }
        else{
            return res.status(200).json({
                success: true,
                message: "Updated hospital details for " + count + " hospitals"
            })
        }
    }catch(error:any){
        console.log("Error in updating hospital details according to new model " + error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}