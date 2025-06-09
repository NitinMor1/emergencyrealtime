import { getCollection } from "../../db/db";
import { Router, Request, Response } from "express";
import { IDoctor } from "../account/doctors/DoctorModel";
import { IPatient } from "../account/patients/PatientModel";
import { getPatientUserName } from "./ctrlfunc";


const dataRouter = Router();

dataRouter.get("/get_patients", async (req: Request, res: Response) => {
  try {
    const { patientData, phoneNumber, hospitalId } = req.query;
    let query;
    if (
      patientData ? patientData?.toString().includes("@medoc") ?? false : false
    ) {
      query = { username: patientData?.toString().toLocaleLowerCase() };
    } else if (phoneNumber && phoneNumber.toString().trim().length === 10) {
      query = { phoneNumber: phoneNumber };
    } else {
      const regex = new RegExp(patientData?.toString() ?? "null", "i"); // 'i' for case-insensitive matching

      // Find documents where patientData contains the substring
      query = { name: { $regex: regex } };
    }
    const patientColl = await getCollection<IPatient>("PatientList", null);

    const result = await patientColl.findOne(query);
    console.log(result);
    if (result) {
      return res.status(200).json({ result });
    } else {
      let name, username, age, email, family, profileUrl, vitals;
      if (patientData?.toString().includes("@medoc") ?? false) {
        username = patientData?.toString();
      } else {
        name = patientData?.toString()?.trim();
        username = getPatientUserName(name);
      }
      const newpatient: IPatient = {
        hospitalId: hospitalId?.toString() ?? "",
        username: getPatientUserName(name) ?? "",
        name: name ?? "",
        age: age ?? 0,
        password: "",
        email: email ?? "",
        family: family ?? [],
        listOfDoctors: [],
        listOfHospitals: [],
        profileUrl: profileUrl ?? "",
        vitals: vitals ?? [],
        personalHealth: null,
        patientVaccination: [],
        bloodGroup: "",
        address: "",
        pincode: "",
        phoneNumber: "",
        secondaryPhoneNumber: "",
        group: "",
        flag: "",
        familyHistory: "",
        parentsDetails: {
          motherHeight: 0,
          motherName: "",
          motherProfession: "",
          fatherHeight: 0,
          fatherName: "",
          fatherProfession: "",
        },
        allergies: "",
        additionalNotes: "",
        preTermDays: 0,
        referredBy: "",
        school: "",
        dob: "",
        officeId: "",
        patientId: "",
        gender: "",
        patientGrowth: [],
      };
      const result = await patientColl.insertOne(newpatient);
      const r1 = await patientColl.findOne({ _id: result.insertedId });
      return res.status(200).json({ result: r1 });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

dataRouter.get("/get_doctor", async (req: Request, res: Response) => {
  try {
    const { doc, hospitalId } = req.query;
    const docColl = await getCollection<IDoctor>("DoctorList", null);
    const regex = new RegExp(doc?.toString() ?? "null", "i"); // 'i' for case-insensitive matching

    // Find documents where patientData contains the substring
    const query = { doctorName: { $regex: regex }, listOfHospitals: hospitalId };
    const result = await docColl.findOne(query);

    res.status(200).json({ result });
  } catch (error) {
    console.error("Error in /data/get_doctor", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default dataRouter;
