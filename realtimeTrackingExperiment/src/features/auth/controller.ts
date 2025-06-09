import { getCollection, mongoErrorHandler } from "../../db/db";
import { Router, Request, Response } from "express";
import { EhospitalType, IDoctor, IHospital, IPasskey, IRefreshToken } from "./HospitalModel";
import { generateJWTToken, generatePasskey, generateRefreshToken, verifyRefreshToken } from "./ctrl_func";
import { ObjectId } from "mongodb";
import exceljs from "exceljs";
import {  pricing } from "../account/invoices/CGHSListMVC";
import fs from "fs";
import { v4 as uuid} from "uuid";
const authRouter = Router();

import multer from "multer";
import path from "path";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { IPatient } from "../account/patients/PatientModel";
import { IADMIN, IEmployee, IShift } from "../resource/HRMS/hrModel";
import { getEmployeeId } from "../account/users/user_ctrlfunc";

const tempDir = path.join(__dirname, "../public/temp");
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Multer configuration for file upload
const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, tempDir); // Use the tempDir variable
    },
    filename: function (_req, file, cb) {
        const uniqueSuffix = Date.now();
        const ext = path.extname(file.originalname); // Get the file extension
        const basename = path.basename(file.originalname, ext); // Get the filename without extension
        const sanitizedBasename = basename.replace(/[^a-zA-Z0-9]/g, "_"); // Replace special characters with underscores
        const filename = `${sanitizedBasename}-${uniqueSuffix}${ext}`; // Combine basename, timestamp, and extension
        cb(null, filename);
    },
});

function checkFileType(file: any, cb: any) {
    const filetypes = /xlsx|csv/; // Allowed file types
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // Check the file extension
    if (extname) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

export const upload = multer({
    storage,
    fileFilter: function (_req, file, cb) {
        console.log(`Uploading file: ${file.originalname}`);
        checkFileType(file, cb);
    },
});

// Function to extract prices from an Excel file
export async function extractPriceFromXlsxFile(filePath: string): Promise<pricing[]> {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.worksheets[0]; // Get the first sheet
    const rawData: any[] = [];

    // Iterate through rows (skip the header row)
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
            const rowData: any = {};
            row.eachCell((cell, colNumber) => {
                const headerValue = sheet.getRow(1).getCell(colNumber).value;
                if (typeof headerValue === 'string') {
                    rowData[headerValue] = cell.value;
                }
            });
            rawData.push(rowData);
        }
    });

    // Map raw data to pricing objects
    return rawData.map((data: any) => ({
        name: data["Name"]?.toString() || "", // Ensure name is a string
        NABHPrice: Number(data["NABHPrice"]) || parseInt("0"), // Ensure NABHPrice is a number
        NON_NABHPrice: Number(data["NON_NABHPrice"]) || parseInt("0"), // Ensure NON_NABHPrice is a number
        CustomPrice: Array.isArray(data["CustomPrice"]) ? data["CustomPrice"] : [], // Ensure CustomPrice is always an array
    }));
}

// Route to create a hospital
authRouter.post("/createHospital", upload.single("file"), async (req: Request, res: Response) => {
    try {
        const file = req.file?.path;
        const { hospitalType, name, phoneNumber, email, address, listOfDoctors, ambulance, labs, room, depts, roleAccess, roomPrices } = req.body;

        // Get Hospitals collection
        const coll = await getCollection<IHospital>("Hospitals", null);

        // Generate hospital details
        const testhos: IHospital = {
            hospitalId: generatePasskey("hos"),
            hospitalType: hospitalType ?? EhospitalType.HOSPITAL,
            name: name ?? "Medoc_Hospital",
            phoneNumber: phoneNumber ?? "",
            email: email ?? "",
            password: {
                password: generatePasskey(null),
                expiresAt: new Date(new Date().setFullYear(2025)).toISOString()
            },
            address: address ?? "",
            ambulance: ambulance ?? [],
            labs: labs ?? [],
            passkeys: [],
            room: room ?? [],
            depts: depts ?? [],
            roleAccess: roleAccess ?? {
                "admin": ["Accounts", "Dashboard", "Emergency", "OPD", "Equipments", "IPD", "Messages", "Surgery Schedule", "Staff", "Finance", "Inventory", "Labs/Scans"],
                "hr": ["Accounts", "Staff", "Finance", "My Attendance"],
                "pharma": ["Accounts", "Inventory", "My Attendance"],
                "paramedics": ["Accounts", "Emergency", "My Attendance"],
                "nurse": ["Accounts", "Messages", "OPD", "IPD", "Surgery Schedule", "Labs/Scans", "Dashboard", "My Attendance"]
            },
            discount: {
                opdDiscount: {
                    VisitCount: 0,
                    Discount: 0,
                    freeOpdInterval: 7 // in days
                }
            }
        };

        // Create unique index
        await coll.createIndex({ "hospitalId": 1 }, { unique: true });

        // Insert hospital
        const hospitalResult = await coll.insertOne(testhos);

        // If file is provided, insert prices
        if (file) {
            const prices = await extractPriceFromXlsxFile(file);
            const priceCollection = await getCollection<pricing>("Prices", testhos.hospitalId);
            await priceCollection.insertMany(prices);
        }

        return res.status(201).json({
            success: true,
            message: "Hospital created successfully",
            hospitalId: testhos.hospitalId
        });
    } catch (error: any) {
        console.error("Error in createHospital", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
});

export const createPasskey = async (req: Request, res: Response) => {
    try {
        const { empId, role, hospitalId } = req.query; //mongoId
        const mongoEmpId = new ObjectId(empId as string);
        let date = new Date().setFullYear(2025);
        const passkey: IPasskey = {
            role: role?.toString(), //role of the employee
            empId: mongoEmpId.toString(),
            expiresAt: new Date(date).toISOString(),
            key: generatePasskey(null),
        };

        const hospitalColl = await getCollection<IHospital>("Hospitals", null);
        const checkIfPasskeyAlreadyExist = await hospitalColl.findOne({
            passkeys: { $elemMatch: { empId: mongoEmpId.toString() } }
        })
        if (checkIfPasskeyAlreadyExist) {
            return res.status(400).json({
                success: false,
                message: "Passkey already exists for this employee"
            });
        }
        const result = await hospitalColl.findOneAndUpdate(
            { hospitalId: hospitalId?.toString() },
            { $push: { passkeys: passkey } },
            { returnDocument: "after" }
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found"
            });
        } else {
            return res.status(201).json({
                success: true,
                message: "Passkey created successfully",
                passkey: passkey.key,
                expiresAt: passkey.expiresAt
            });
        }
    } catch (error: any) {
        console.error("Error in createPasskey", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


authRouter.post("/login", async (req: Request, res: Response) => {
    try {
        const { passkey } = req.body
        const hospitalColl = await getCollection<IHospital>("Hospitals", null);
        const result = await hospitalColl.findOne({
            "passkeys.key": passkey,
            $expr: {
                $gte: ['$passkeys.expiresAt', new Date().toISOString()]
            }
        })
        if (!result) {
            return res.status(404).json({ error: "Invalid Passkey" });
        }
        const key = result?.passkeys.find(p => p.key == passkey);
        if (!key) {
            throw new Error("Invalid pass key");
        }
        const refreshToken = await generateRefreshToken(result.hospitalId, key?.key ?? "");
        const refreshTokenColl = await getCollection<IRefreshToken>("RefreshTokens", null);

        const savedToken = await refreshTokenColl.findOne({ hospitalId: result.hospitalId, passkey: key.key });

        if (savedToken) {
            await refreshTokenColl.findOneAndUpdate({
                hospitalId: result.hospitalId, passkey: key.key
            },
                { $push: { tokens: refreshToken } });
        }

        else {
            await refreshTokenColl.insertOne({
                hospitalId: result.hospitalId,
                passkey: key.key,
                tokens: [refreshToken]
            });
        }
        const employeeColl = await getCollection<IEmployee>("Employee", result.hospitalId as string);
        const employee = await employeeColl.findOne({ _id: new ObjectId(key?.empId) });
        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }
        const empRoleAccess = employee.HR.roleAccess || [];
        
        const user = {
            hospitalId: result.hospitalId,
            role: key?.role,
            empId: key?.empId,
            ambulance: result.ambulance,
            expiresAt: key?.expiresAt,
            room: result.room,
            sessionToken: await generateJWTToken(result.hospitalId, key.key),
            refreshToken: refreshToken,
            roleAccess: result.roleAccess,
            empRoleAccess: empRoleAccess,
            spacings: result.spacings,
            colors: result.colors,
            discount: result.discount,
            Images: result.Images,
            labs: result.labs,
        }
        return res.status(200).json({ user })
    } catch (e) {
        mongoErrorHandler(e, "Error in Login Handled", "Error in Login")
        return res.status(500).json({ error: "Internal Server Error" })
    }
})

authRouter.post("/superUser", async (req: Request, res: Response) => {
    try {
        const { passkey } = req.body
        console.log(req.body);
        const hospitalColl = await getCollection<IHospital>("Hospitals", null);

        const result = await hospitalColl.findOne({
            "password.password": passkey,
            $expr: {
                $gte: ['$password.expiresAt', new Date().toISOString()]
            }
        })
        console.log(result);
        if (!result) {
            return res.status(404).json({ error: "Invalid Passkey" })
        }
        const key = result?.passkeys.find(p => p.key == passkey)
        const user = {
            hospitalId: result.hospitalId,
            name: result.name,
            phoneNumber: result.phoneNumber,
            email: result.email,
            address: result.address,
            ambulance: result.ambulance,
            labs: result.labs,
            room: result.room,
            depts: result.depts,
            passkeys: result.passkeys,
            sessionToken: await generateJWTToken(result.hospitalId, key?.key ?? ""),
            roleAccess: result.roleAccess,
            spacings: result.spacings,
            colors: result.colors,
            discount: result.discount,
            Images: result.Images,
        }
        return res.status(200).json({ user })
    } catch (e) {
        mongoErrorHandler(e, "Error in Login Handled", "Error in Login")
        return res.status(500).json({ error: "Internal Server Error" })
    }
})

authRouter.post("/refresh", async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                success: true,
                message: "token is required !"
            })
        }

        const refreshTokenColl = await getCollection<IRefreshToken>("RefreshTokens", null);
        const savedToken = await refreshTokenColl.findOne({ tokens: token });
        if (!savedToken) {
            return res.status(400).json({
                success: true,
                message: "Invalid token!"
            })
        }
        const payload = await verifyRefreshToken(token);

        if (typeof payload != "object") {
            throw new Error("token can't be decoded")
        }
        const sessionToken = await generateJWTToken(payload.hospitalId, payload.passkey)
        return res.status(200).json({
            success: true,
            sessionToken: sessionToken
        })
    } catch (e) {
        if (e instanceof TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: "JWT token expired !!"
            })
        }
        if (e instanceof JsonWebTokenError) {
            return res.status(403).json({
                success: false,
                message: "Invalid token signature !!"
            })
        }
        mongoErrorHandler(e, "Error in generating new token", "Error in refresh token")
        return res.status(500).json({ error: "Internal Server Error" })
    }
})

authRouter.post("/setLoginDistance", async (req: Request, res: Response) => {
    try{
        const {hospitalId, distance} = req.body;

        const hospitalColl = await getCollection<IHospital>("Hospitals", null);
        const hospital = await hospitalColl.findOne({ hospitalId: hospitalId as string });

        if (!hospital) {
            return res.status(404).json({ error: "Hospital not found" });
        }

        const updatedHospital = await hospitalColl.updateOne(
            { hospitalId: hospitalId as string },
            { $set: { loginDistance: distance } }
        );

        if (updatedHospital.modifiedCount === 0) {
            return res.status(400).json({ error: "Failed to update login distance" });
        }
        return res.status(200).json({ message: "Login distance updated successfully" });

    }catch(error:any){
        console.error("Error in setLoginDistance:", error);
        return res.status(500).json({ error: "Internal Server Error", success: false });
    }
})

authRouter.get("/getColors", async (req: Request, res: Response) => {
    try{
        const hospitalId = req.query.hospitalId as string;
        const hospitalColl = await getCollection<IHospital>("Hospitals", null);
        const hospital = await hospitalColl.findOne({ hospitalId: hospitalId });
        if(!hospital){
            return res.status(404).json({ error: "Hospital not found" });
        }
        const colors = hospital.colors || {
            primaryColor: "#000000",
            secondaryColor: "#FFFFFF",
            accentColor: "#FF0000",
            backgroundColor: "#F0F0F0"
        };
        return res.status(200).json({ colors });
    }catch(error:any){
        console.error("Error in getColors:", error);
        return res.status(500).json({ error: "Internal Server Error", success: false });
    }
})


authRouter.post("/updateColors", async (req: Request, res: Response) => { 
    try{
        const { hospitalId, colors } = req.body;
        const hospitalColl = await getCollection<IHospital>("Hospitals", null);
        const hospital = await hospitalColl.findOne({ hospitalId: hospitalId });
        if(!hospital){
            return res.status(404).json({ error: "Hospital not found" });
        }
        const updatedColors = await hospitalColl.findOneAndUpdate({ hospitalId: hospitalId }, { $set: { colors: colors } });
        if(!updatedColors){
            return res.status(400).json({ error: "Failed to update colors" });
        }
        return res.status(200).json({ message: "Colors updated successfully" });
    }catch(error:any){  
        console.error("Error in updateColors:", error);
        return res.status(500).json({ error: "Internal Server Error", success: false });
    }
})


authRouter.post("/updatePatientPid", async (req: Request, res: Response) => {
    try{
        const patientColl = await getCollection<IPatient>("Patients", null);
        const patients: IPatient[] = await patientColl.find({}).toArray();
        const markedPatients: IPatient[] = patients.filter((patient) => {
            return patient.patientId === undefined || patient.patientId === null || patient.patientId === "";
        });
        const bulkOps = markedPatients.map((patient) => {
            return {
                updateOne: {
                    filter: { _id: patient._id },
                    update: { $set: { patientId: `p_${uuid().substring(0, 10)}` } }
                }
            };
        });
        
        if (bulkOps.length > 0) {
            await patientColl.bulkWrite(bulkOps);
        }
        
        return res.status(200).json({ 
            message: `Updated ${bulkOps.length} patients with new patient IDs`,
            success: true
        });
    }catch(error:any){
        console.error("Error in updatePatientPid:", error);
        return res.status(500).json({ error: "Internal Server Error", success: false });
    }
})

authRouter.post("/setLoginDistance", async (req: Request, res: Response) => {
    try{
        const {hospitalId, distance} = req.body;

        const hospitalColl = await getCollection<IHospital>("Hospitals", null);
        const hospital = await hospitalColl.findOne({ hospitalId: hospitalId as string });

        if (!hospital) {
            return res.status(404).json({ error: "Hospital not found" });
        }

        const updatedHospital = await hospitalColl.updateOne(
            { hospitalId: hospitalId as string },
            { $set: { loginDistance: distance } }
        );

        if (updatedHospital.modifiedCount === 0) {
            return res.status(400).json({ error: "Failed to update login distance" });
        }
        return res.status(200).json({ message: "Login distance updated successfully" });

    }catch(error:any){
        console.error("Error in setLoginDistance:", error);
        return res.status(500).json({ error: "Internal Server Error", success: false });
    }
})



authRouter.post("/updateRoleAccess", async (req: Request, res: Response) => {
    try {
        const { hospitalId, role, roleAccess } = req.body;

        if (!hospitalId || !role || !roleAccess || !Array.isArray(roleAccess)) {
            return res.status(400).json({ error: "Missing required fields or invalid data format", success: false });
        }

        const employeeColl = await getCollection<IEmployee>("Employee", hospitalId as string);
        
        // Find all employees with the specified role
        const employees = await employeeColl.find({
            "HR.role.role": role as IADMIN
        }).toArray();
        
        if (employees.length === 0) {
            return res.status(404).json({ error: "No employees found with the specified role", success: false });
        }

        // Update the roleAccess for all found employees
        const updateResult = await employeeColl.updateMany(
            { "HR.role.role": role as IADMIN },
            { $set: { "HR.roleAccess": roleAccess } }
        );

        // Create a summary of updated employees
        const updatedEmployeesSummary = employees.map((emp) => {
            return {
                hospitalId: emp.hospitalId,
                contactDetails: {
                    name: emp.ContactDetails.name,
                    employeeId: emp.ContactDetails.employeeId,
                    phoneNumber: emp.ContactDetails.phoneNumber,
                    email: emp.ContactDetails.email
                }
            };
        });

        return res.status(200).json({ 
            success: true, 
            message: `Role access updated for all ${role} employees`,
            updatedCount: updateResult.modifiedCount,
            employees: updatedEmployeesSummary
        });
        
    } catch (error: any) {
        console.error("Error in updating Role Access", error);
        return res.status(500).json({ error: "Internal Server Error", success: false });
    }
});




// authRouter.post("/updateRoleAccess", async (req: Request, res: Response) => {
//     try {
//         const hospitalColl = await getCollection<IHospital>("Hospitals", null);

//         const hospitalsWithoutRoleAccess = await hospitalColl
//             .find({ roleAccess: { $exists: false } })
//             .toArray();

//         if (hospitalsWithoutRoleAccess.length === 0) {
//             return res.status(200).json({
//             success: true,
//             message: "All hospitals already have the roleAccess field",
//             });
//         }

//         const defaultRoleAccess = {
//             admin: [
//             "Accounts",
//             "Dashboard",
//             "Emergency",
//             "OPD",
//             "Equipments",
//             "IPD",
//             "Messages",
//             "Surgery Schedule",
//             "Staff",
//             "Finance",
//             "Inventory",
//             "Labs/Scans",
//             ],
//             hr: ["Accounts", "Staff", "Finance", "My Attendance"],
//             pharma: ["Accounts", "Inventory", "My Attendance"],
//             paramedics: ["Accounts", "Emergency", "My Attendance"],
//             nurse: [
//             "Accounts",
//             "Messages",
//             "OPD",
//             "IPD",
//             "Surgery Schedule",
//             "Labs/Scans",
//             "Dashboard",
//             "My Attendance",
//             ],
//         };

//         for (const hospital of hospitalsWithoutRoleAccess) {
//             await hospitalColl.updateOne(
//                 { _id: hospital._id },
//                 { $set: { ...hospital, roleAccess: defaultRoleAccess } }
//             );
//         }

//         return res.status(200).json({
//             success: true,
//             message: `Updated ${hospitalsWithoutRoleAccess.length} hospitals with default roleAccess`,
//         });
//     } catch (error: any) {
//       console.error("Error in updating roleAccess", error);
//       return res.status(500).json({
//         success: false,
//         message: "Error in updating roleAccess",
//       });
//     }
// });  

// authRouter.post("/updateHospitalDoctor", async (req: Request, res: Response) => {
//     try {
//         const hospitalColl = await getCollection<IHospital>("Hospitals", null);
//         const hospitals = await hospitalColl.find({}).toArray();

//         for (let hospital of hospitals) {
//             const updatedDoctors = hospital.listOfDoctors.map(doctor => {
//                 const updatedDoctor = { ...doctor };
//                 // Check if specialization is an array
//                 if (Array.isArray(doctor.specialization)) {
//                     // Take the first element if array is not empty, otherwise empty string
//                     updatedDoctor.specialization = doctor.specialization.length > 0 
//                         ? doctor.specialization[0] 
//                         : "Cardiologist";
//                 }
//                 // If it's already a string, leave it as is
//                 return updatedDoctor;
//             });

//             // Update the hospital document in the database
//             await hospitalColl.updateOne(
//                 { hospitalId: hospital.hospitalId },
//                 { $set: { listOfDoctors: updatedDoctors } }
//             );
//         }

//         return res.status(200).json({
//             success: true,
//             message: "Successfully updated hospital doctors' specializations",
//         });
//     } catch (error: any) {
//         console.error("Error in updating hospital doctor", error);
//         return res.status(500).json({
//             success: false,
//             message: "Error in updating hospital doctor",
//             error: error.message
//         });
//     }
// });
// authRouter.post("/updateRoom" , async (req: Request, res: Response) => {
//     try{
//         const hospitalColl = await getCollection<IHospital>("Hospitals", null);
//         const {room} = req.body;
//         const hospitals = await hospitalColl.find({}).toArray();
//         for (let hospital of hospitals) {
//             // replace the current room array with new room array from req body
//             await hospitalColl.updateOne(
//                 { hospitalId: hospital.hospitalId },
//                 { $set: { room: room } }
//             );
//         }
//         return res.status(200).json({
//             success: true,
//             message: "Successfully updated hospital room types",
//         });
//     }catch(error:any){
//         return res.status(500).json({
//             success: false,
//             message: "Error in updating hospital mode",
//             error: error.message
//         })
//     }
// })

// authRouter.post("/aDTE", async (req: Request, res: Response) => {
//     try{
//         const {hospitalId, phoneNumber} = req.body;
//         const doctorColl = await getCollection<IDoctor>("DoctorList", null);
//         const employeeColl = await getCollection<IEmployee>("Employee", hospitalId as string);
//         const doctor = await doctorColl.findOne({ 
//             phoneNumber: phoneNumber, 
//         });
//         console.log(doctor);
//         if(!doctor){
//             return res.status(404).json({ error: "Doctor not found" });
//         }
//         const employeeData:IEmployee = {
//             hospitalId: hospitalId as string,
//             ContactDetails: {
//                 name: doctor?.doctorName as string,
//                 email: doctor?.email as string,
//                 phoneNumber: doctor?.phoneNumber as string,
//                 address: doctor?.address as string,
//                 dateOfBirth: "",
//                 employeeId: getEmployeeId(doctor?.doctorName, doctor?.phoneNumber),
//                 gender: "male",
//             },
//             HR:{
//                 joining_date:   "",
//                         total_payable_salary:   0,
//                         total_paid_salary:   0,
//                         leaving_date:   "",
//                         salary:   0,
//                         role:   {
//                             role:  IADMIN.DOCTOR,
//                             customName:   "",
//                         },
//                         // role: role,
//                         department:   "",
//                         supervisor:   "",
//                         no_of_leave: 0,
//                         no_of_absent: 0,
//                         attendance:[],
//                         performance_remarks: [],
//                         history_payroll: [],
//                         shift:  IShift.MORNING,
//                         actual_working_hours:   0,
//                         extra_working_hours: 0,
//                         dutyRoster:   [],
//                         allLeaves: [],
//                         roleAccess: [],
//             }
//         }
//         const employee = await employeeColl.findOne({ "ContactDetails.phoneNumber": phoneNumber, hospitalId: hospitalId as string });
//         if(employee){
//             return res.status(400).json({ error: "Employee already exists" });
//         }
//         const result = await employeeColl.insertOne(employeeData);
//         if(!result){
//             return res.status(500).json({ error: "Internal Server Error" });
//         }
//         return res.status(200).json({ message: "Employee created successfully", success: true });

//     }catch(error:any){
//         console.error("Error in aDTE:", error);
//         return res.status(500).json({ error: "Internal Server Error", success: false });
//     }
// })
    export default authRouter;