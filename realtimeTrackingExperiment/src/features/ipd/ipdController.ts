import { ObjectId } from "mongodb";
import { getCollection } from "../../db/db";
import { IIPD, IDIO, IDOS, INonDrugOrder, IRateType, IPlanOfCare, patientMovements } from "./ipdModel";
import { Request, Response } from "express";
import { IPatient, Vitals, PatientMedicalHistory, IPatientMedicalHistoryArray } from "../account/patients/PatientModel";
import { IItem, ITEMTYPE } from "../resource/Inventory/inventoryModel";
import { v4 as uuidv4 } from 'uuid';
import { generateId } from "../../utils/generators/idGenerator";
import { IEquipment } from "../equipments/equipmentModel";
import mongoose from "mongoose";
export const isExpired = (
  creationDate: string,
  creationtime: string,
  daysUntillExpiration: number
) => {
  const pastDate = new Date(
    `${creationDate}${creationtime.trim() ? "T" + creationtime : ""}`
  );
  const currentDate = new Date();

  const timeDifference = currentDate.getTime() - pastDate.getTime();

  const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  return daysPassed > daysUntillExpiration;
};

export const getPatients = async (req: Request, res: Response) => {
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
    const ipdcoll = await getCollection<IIPD>(
      "IPDList",
      hospitalId?.toString()
    );
    const patients: IIPD[] = await ipdcoll.find().skip(lowerLimit).limit(limit).toArray();
    if (!patients) {
      return res.status(404).json({
        success: true,
        message: "No patient found.",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Patients fetched successfully.",
        data: patients,
      });
    }
  } catch (error: any) {
    console.error("Error in getting patients", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching the patients",
    });
  }
};

export const addPatient = async (req: Request, res: Response) => {
  try {
    const {
      hospitalId,
      id,
      patient,
      admissionDate,
      admissionCheckList,
      dischargeDate,
      dischargeChecklist,
      room,
      isbedOccupied,
      diagnosis,
      medications,
      procedures,
      diet,
      allergies,
      visitHistory,
      insurance,
      attendingPhysician,
      nurse,
      familyContact,
      notes,
      Rate_Type,
      NutritionAssessmentForm,
      equipment,
    } = req.body;
    if (
      !hospitalId ||
      !familyContact.phoneNumber ||
      !room ||
      !admissionDate ||
      !nurse
    ) {
      return res.status(400).json({
        success: true,
        message: "Please provide all the required fields.",
      });
    }
    const ipdcoll = await getCollection<IIPD>(
      "IPDList",
      hospitalId?.toString()
    );

    const ipdIdcheck = await ipdcoll.findOne({ id: id });
    //emar log created 
    const emarLog = [{
      empId: nurse.id || "",
      empName: nurse.name || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      actions: "Patient Admitted and EMAR initialized"
    }]


    const newipdId = `ipd-${Math.random()
      .toString(36)
      .substring(2, 5)
      .toUpperCase()}`;
    const ipd: IIPD = {
      hospitalId: hospitalId,
      id: ipdIdcheck ? newipdId : id,
      patient: {
        username: patient.username ?? "",
        name: patient.name ?? "",
        DOS: patient.DOS ?? [],
        DIO: patient.DIO ?? [],
        nonDrugOrder: patient.nonDrugOrder ?? [],
      },
      admissionDate: admissionDate,
      admissionCheckList: admissionCheckList,
      dischargeDate: "",
      dichargeChecklist: dischargeChecklist,
      room: room ?? [],
      isbedOccupied: isbedOccupied,
      diagnosis: diagnosis ?? [],
      medications: medications ?? [],
      procedures: procedures ?? [],
      diet: diet ?? "",
      allergies: allergies ?? [],
      visitHistory: visitHistory || [],
      patientMovement: [],
      insurance: insurance || { id: "", provider: "" },
      attendingPhysician: attendingPhysician || { id: "", name: "" },
      nurse: nurse ?? { id: "", name: "" },
      familyContact: familyContact ?? {
        name: "",
        relation: "",
        phoneNumber: familyContact.phoneNumber,
      },
      notes: notes ?? "",
      Rate_Type: Rate_Type ?? IRateType.NABHPrice,
      NutritionAssessmentForm: NutritionAssessmentForm ?? [],
      equipment: equipment ?? [],
      EMAR: emarLog,

    };
    await ipdcoll.insertOne(ipd);
    return res.status(201).json({
      success: true,
      message: "Patient added successfully.",
      data: ipd,
    });
  } catch (error: any) {
    console.error("Error in adding patient", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const addEquipmentToIPD = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id, quantity, ipdId } = req.query;
    console.log("Received parameters:", { hospitalId, id, quantity, ipdId });

    if (!hospitalId || !id || !quantity || !ipdId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters"
      });
    }

    const mongoId = new ObjectId(id as string);
    const iId = new ObjectId(ipdId as string);

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

    const ipdColl = await getCollection<IIPD>("IPDList", hospitalId.toString());

    // First, check if the surgery exists
    const ipdExist = await ipdColl.findOne({ _id: iId });
    if (!ipdExist) {
      return res.status(404).json({
        success: false,
        message: "ipd not found."
      });
    }

    console.log("Attempting to update ipd:", iId);
    const updateSurgeryResult = await ipdColl.findOneAndUpdate(
      { _id: iId },
      { $push: { equipment: equipmentObject } },
      { returnDocument: "after" }
    );

    if (!updateSurgeryResult) {
      console.error("Failed to update surgery:", iId);
      return res.status(500).json({
        success: false,
        message: "Failed to add equipment to surgery."
      });
    }

    console.log("Successfully updated ipd. Updating equipment quantity.");
    const updateEquipmentResult = await equipmentColl.findOneAndUpdate(
      { _id: mongoId },
      {
        $set: {
          quantity: equipment.quantity - quantityToAdd,
          issuedTo: iId.toString(),
          issuedOn: new Date(),
        }
      },
      { returnDocument: "after" }
    );

    if (!updateEquipmentResult) {
      console.error("Failed to update equipment:", mongoId);
      // Rollback the surgery update
      await ipdColl.findOneAndUpdate(
        { _id: iId },
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
      message: "Equipment added to ipd successfully.",
      data: updateEquipmentResult
    });

  } catch (error: any) {
    console.error("Error in adding equipment to ipd:", error);
    return res.status(500).json({
      success: false,
      message: "Error in adding equipment to ipd",
      error: error.message
    });
  }
}


export const ipdHistory = async (req: Request, res: Response) => {
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
        message: "Please provide hospitalId",
      });
    }

    const ipdcoll = await getCollection<IIPD>(
      "IPDList",
      hospitalId?.toString()
    );

    const history = await ipdcoll.find({ isbedOccupied: false }).skip(lowerLimit).limit(limit).toArray();

    res.status(200).json({
      success: true,
      message: "IPD history fetched successfully.",
      data: history,
    });
  } catch (error: any) {
    console.error("Error in getting IPD history", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updatePatient = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const patient = req.body;
    const ipdcoll = await getCollection<IIPD>(
      "IPDList",
      hospitalId?.toString()
    );

    //emar starts here 
    const existingPatient = await ipdcoll.findOne({ _id: new ObjectId(id as string) });

    if (!existingPatient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }

    const deconstructedPatient: IIPD = {
      hospitalId: patient.hospitalId ?? existingPatient.hospitalId ?? "",
      id: patient.id ?? existingPatient.id ?? "",
      patient: {
        username: patient.patient.username ?? existingPatient.patient.username ?? "",
        name: patient.patient.name ?? existingPatient.patient.name ?? "",
        DOS: patient.patient.DOS ?? existingPatient.patient.DOS ?? [],
        DIO: patient.patient.DIO ?? existingPatient.patient.DIO ?? [],
        nonDrugOrder: patient.patient.nonDrugOrder ?? existingPatient.patient.nonDrugOrder ?? [],
      },
      admissionDate: patient.admissionDate ?? existingPatient.admissionDate ?? "",
      admissionCheckList: patient.admissionCheckList ?? existingPatient.admissionCheckList ?? [],
      dischargeDate: patient.dischargeDate ?? existingPatient.dischargeDate ?? "",
      dichargeChecklist: patient.dichargeChecklist ?? existingPatient.dichargeChecklist ?? [],
      room: patient.room ?? existingPatient.room ?? [],
      isbedOccupied: patient.isbedOccupied ?? existingPatient.isbedOccupied ?? false,
      diagnosis: patient.diagnosis ?? existingPatient.diagnosis ?? [],
      medications: patient.medications ?? existingPatient.medications ?? [],
      procedures: patient.procedures ?? existingPatient.procedures ?? [],
      diet: patient.diet ?? existingPatient.diet ?? "",
      allergies: patient.allergies ?? existingPatient.allergies ?? [],
      visitHistory: patient.visitHistory ?? existingPatient.visitHistory ?? [],
      patientMovement: patient.patientMovement ?? existingPatient.patientMovement ?? [],
      insurance: patient.insurance ?? existingPatient.insurance ?? { id: "", provider: "" },
      attendingPhysician: patient.attendingPhysician ?? existingPatient.attendingPhysician ?? { id: "", name: "" },
      nurse: patient.nurse ?? existingPatient.nurse ?? { id: "", name: "" },
      familyContact: patient.familyContact ?? existingPatient.familyContact ?? {
        name: "",
        relation: "",
        phoneNumber: patient.familyContact.phoneNumber,
      },
      notes: patient.notes ?? existingPatient.notes ?? "",
      Rate_Type: patient.Rate_Type ?? existingPatient.Rate_Type ?? IRateType.NABHPrice,
      NutritionAssessmentForm: patient.NutritionAssessmentForm ?? existingPatient.NutritionAssessmentForm ?? [],
      equipment: patient.equipment ?? existingPatient.equipment ?? [],
      EMAR: patient.EMAR ?? existingPatient.EMAR ?? [],
    };


    const emarEntry = {
      empId: patient?.nurse?.id || "",
      empName: patient?.nurse?.name || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      actions: "Patient Record Updated"
    };

    const updatedEMAR = Array.isArray(existingPatient.EMAR)
      ? [...existingPatient.EMAR, emarEntry]
      : [emarEntry];

    deconstructedPatient.EMAR = updatedEMAR;
    //emar ends here 
    const updateResult = await ipdcoll.findOneAndUpdate(
      { _id: new ObjectId(id as string) },
      { $set: deconstructedPatient },
      { returnDocument: "after" }
    );
    if (updateResult) {
      return res.status(201).json({
        success: true,
        message: "Patient updated successfully.",
        data: updateResult,
      });
    } else {
      return res.status(404).json({
        success: true,
        message: "Patient not found.",
      });
    }
  } catch (error: any) {
    console.error("Error in updating patient", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deletePatient = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const ipdcoll = await getCollection<IIPD>(
      "IPDList",
      hospitalId?.toString()
    );
    const deleteResult = await ipdcoll.findOneAndDelete({ _id: new ObjectId(id as string) });
    if (deleteResult) {
      return res.status(201).json({
        success: true,
        message: "Patient deleted successfully.",
        data: deleteResult,
      });
    } else {
      return res.status(404).json({
        success: true,
        message: "Patient not found.",
      });
    }
  } catch (error: any) {
    console.error("Error in deleting patient", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const addPatientVitals = async (req: Request, res: Response) => {
  try {
    const { hospitalId, username, patientId } = req.query;
    const {
      date,
      time,
      patientOfficeId,
      note,
      status,
      unit,
      value,
      vitalId,
      vitalName,
    } = req.body;
    if (!hospitalId || !username || !patientId) {
      return res.status(400).json({
        success: false,
        message: "Please provide hospitalId, username and patientId",
      });
    }
    if (
      !date || !time || !patientOfficeId || !status || !unit || !value || !vitalName
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the required fields",
      });
    }

    const vitalsCollection = await getCollection<IPatient>("PatientList", null);

    const newVitals: Vitals = {
      patientUsername: username.toString(),
      date,
      time,
      patientOfficeId: patientOfficeId.toString(),
      note: note || "",
      status,
      unit,
      value,
      vitalId: vitalId || `vital_${uuidv4().substring(0, 7)}`,
      vitalName,
    };

    const result = await vitalsCollection.findOneAndUpdate(
      {
        patientId: patientId.toString(),
        listOfHospitals: { $in: [hospitalId?.toString()] as string[] },
      },
      { $push: { vitals: newVitals } },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({
        success: true,
        message: "Patient not found",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Vitals added successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error in adding vitals", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const addDrugOrderSheet = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoID = new ObjectId(id as string);
    const {
      date,
      time,
      drugName,
      dosage,
      Route,
      frequency,
      nurse,
      witness,
      pharmacist,
      doctor,
    } = req.body;

    if (!mongoID || !hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the required fields",
      });
    }

    const dosColl = await getCollection<IIPD>("IPDList", hospitalId.toString());

    const newDOS: IDOS = {
      date,
      time,
      drugName: drugName || "",
      dosage: dosage || "",
      Route: Route || "",
      frequency: frequency || "",
      nurse,
      witness,
      pharmacist,
      doctor,
    };

    const result = await dosColl.findOneAndUpdate(
      { _id: mongoID },
      {
        $push: { "patient.DOS": newDOS },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Drug Order Sheet added successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error in adding drug order sheet", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

export const addDrugInfusionSheet = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const {
      date,
      time,
      drugName,
      dosage,
      diluent,
      diluentVolume,
      infusionRate,
      route,
      frequency,
      goal,
      nurse,
      witness,
      pharmacist,
    } = req.body;
    if (!mongoId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the required fields",
      });
    }
    const dosColl = await getCollection<IIPD>(
      "IPDList",
      hospitalId?.toString()
    );
    const newDIO: IDIO = {
      date,
      time,
      drugName: drugName || "",
      dosage: dosage || "",
      diluent: diluent || "",
      diluentVolume: diluentVolume || "",
      infusionRate: infusionRate || "",
      route: route || "",
      frequency: frequency || "",
      goal: goal || "",
      nurse,
      witness,
      pharmacist,
    };
    const result = await dosColl.findOneAndUpdate(
      { _id: mongoId },
      {
        $push: { "patient.DIO": newDIO },
      },
      {
        returnDocument: "after",
      }
    );
    if (!result) {
      return res.status(404).json({
        success: true,
        message: "Patient not found",
      });
    }
    return res.status(201).json({
      success: true,
      message: "Drug Order Sheet added successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error in adding drug order sheet", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

export const addNonDrugOrderSheet = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const { date, time, order, PhysicianSign } = req.body;
    if (!mongoId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the required fields",
      });
    }
    const dosColl = await getCollection<IIPD>(
      "IPDList",
      hospitalId?.toString()
    );
    const newNDOS: INonDrugOrder = {
      date,
      time,
      order,
      PhysicianSign,
    };
    const result = await dosColl.findOneAndUpdate(
      { _id: mongoId },
      {
        $push: { "patient.nonDrugOrder": newNDOS },
      },
      {
        returnDocument: "after",
      }
    );
    if (!result) {
      return res.status(404).json({
        success: true,
        message: "Patient not found",
      });
    }
    return res.status(201).json({
      success: true,
      message: "Drug Order Sheet added successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error in adding drug order sheet", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

export const getDrugName = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.query;
    const itemColl = await getCollection<IItem>("Item", hospitalId?.toString());
    const drugName: IItem[] = await itemColl
      .find({
        itemType: { $eq: ITEMTYPE.MEDICINE },
      })
      .toArray();

    if (!drugName) {
      return res.status(404).json({
        success: true,
        message: "No patient found.",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Patients fetched successfully.",
        data: drugName,
      });
    }
  } catch (error: any) {
    console.error("Error in getting patients", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching the patients",
    });
  }
};

export const getIPDById = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;

    if (!id || !ObjectId.isValid(id as string)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing IPD ID.",
      });
    }

    const ipdcoll = await getCollection<IIPD>(
      "IPDList",
      hospitalId?.toString()
    );

    const ipd = await ipdcoll.findOne({ _id: new ObjectId(id as string) });

    if (!ipd) {
      return res.status(404).json({
        success: false,
        message: "IPD record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "IPD record fetched successfully.",
      data: ipd,
    });
  } catch (error: any) {
    console.error("Error in getting IPD by ID", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching the IPD record.",
    });
  }
};

export const countOccupiedBedInIpd = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.query;
    if (!hospitalId) {
      return res.status(400).json({
        message: "HospitalId is required",
        success: false
      })
    }
    const ipdColl = await getCollection<IIPD>("IPDList", hospitalId?.toString());
    const ipd = await ipdColl.find({
      isbedOccupied: true
    }).toArray();
    if (!ipd) {
      return res.status(404).json({
        message: "IPD not found",
        success: true
      })
    }
    return res.status(200).json({
      message: "IPD fetched successfully",
      success: true,
      data: ipd.length,
    })
  } catch (error: any) {
    console.error("Error in counting occupied bed", error);
    return res.status(5000).json({
      message: "Internal Server Error",
      success: false,
    })
  }
}

export const updateDrugInfusionSheet = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id, Date, Time } = req.query;
    const mongoId = new ObjectId(id as string);
    const drugInfusionSheet = req.body;
    const ipdcoll = await getCollection<IIPD>(
      "IPDList",
      hospitalId?.toString()
    )
    const ipd = await ipdcoll.findOne({ _id: mongoId });
    if (!ipd) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      })
    }
    const findDIO = await ipd.patient.DIO.find((dio) => dio.date === Date && dio.time === Time);
    if (!findDIO) {
      return res.status(404).json({
        success: false,
        message: "Drug infusion sheet not found"
      })
    }
    const updateResult = await ipdcoll.findOneAndUpdate({
      _id: mongoId,
      "patient.DIO.date": Date,
      "patient.DIO.time": Time
    }, {
      $set: {
        "patient.DIO.$": drugInfusionSheet
      }
    }, {
      returnDocument: "after"
    });
    if (updateResult) {
      return res.status(201).json({
        success: true,
        message: "Drug infusion sheet updated successfully",
        data: updateResult
      })
    }
  } catch (error: any) {
    console.error("Error in updating drug infusion sheet", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}

export const updateDrugOrderSheet = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id, Date, Time } = req.query;
    const mongoId = new ObjectId(id as string);
    const drugOrderSheet = req.body;
    const ipdcoll = await getCollection<IIPD>(
      "IPDList",
      hospitalId?.toString()
    )
    const ipd = await ipdcoll.findOne({ _id: mongoId });
    if (!ipd) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      })
    }
    const findDOS = await ipd.patient.DOS.find((dos) => dos.date === Date && dos.time === Time);
    if (!findDOS) {
      return res.status(404).json({
        success: false,
        message: "Drug order sheet not found"
      })
    }
    const updateResult = await ipdcoll.findOneAndUpdate({
      _id: mongoId,
      "patient.DOS.date": Date,
      "patient.DOS.time": Time
    }, {
      $set: {
        "patient.DOS.$": drugOrderSheet
      }
    }, {
      returnDocument: "after"
    });
    if (updateResult) {
      return res.status(201).json({
        success: true,
        message: "Drug order sheet updated successfully",
        data: updateResult
      })
    }
  } catch (error: any) {
    console.error("Error in updating drug order sheet", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}

export const updateNonDrugOrderSheet = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id, Date, Time } = req.query;
    const mongoId = new ObjectId(id as string);
    const nonDrugOrderSheet = req.body;
    const ipdcoll = await getCollection<IIPD>(
      "IPDList",
      hospitalId?.toString()
    )
    const ipd = await ipdcoll.findOne({ _id: mongoId });
    if (!ipd) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      })
    }
    const findNonDrugOrderSheet = await ipd.patient.nonDrugOrder.find((ndos) => ndos.date === Date && ndos.time === Time);
    if (!findNonDrugOrderSheet) {
      return res.status(404).json({
        success: false,
        message: "Non drug order sheet not found"
      })
    }
    const updateResult = await ipdcoll.findOneAndUpdate({
      _id: mongoId,
      "patient.nonDrugOrder.date": Date,
      "patient.nonDrugOrder.time": Time
    }, {
      $set: {
        "patient.nonDrugOrder.$": nonDrugOrderSheet
      }
    }, {
      returnDocument: "after"
    });
    if (updateResult) {
      return res.status(201).json({
        success: true,
        message: "Non drug order sheet updated successfully",
        data: updateResult
      })
    }
  } catch (error: any) {
    console.error("Error in updating non drug order sheet", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}


export const updateVisitHistory = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id, Date, Time } = req.query;
    const mongoId = new ObjectId(id as string);
    const visitHistory = req.body;
    const ipdcoll = await getCollection<IIPD>(
      "IPDList",
      hospitalId?.toString()
    )
    const ipd = await ipdcoll.findOne({ _id: mongoId });
    if (!ipd) {
      return res.status(404).json({
        success: false,
        message: "Patient not found"
      })
    }
    const findVisitHistory = await ipd.visitHistory.find((visit) => visit.date === Date && visit.time === Time);
    if (!findVisitHistory) {
      return res.status(404).json({
        success: false,
        message: "Visit history not found"
      })
    }
    const updateResult = await ipdcoll.findOneAndUpdate({
      _id: mongoId,
      "visitHistory.date": Date,
      "visitHistory.time": Time
    }, {
      $set: {
        "visitHistory.$": visitHistory
      }
    }, {
      returnDocument: "after"
    });
    if (updateResult) {
      return res.status(201).json({
        success: true,
        message: "Visit history updated successfully",
        data: updateResult
      })
    }
  } catch (error: any) {
    console.error("Error in updating visit history", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}

//MedicalHistory -> collectionName 
// need to discuss with utkarsh and more brainstorming needed
export const createMedicalHistory = async (req: Request, res: Response) => {
  try {
    const {
      patientId,
      hospitalId,
      startingDate,
      endingDate,
      ChiefComplaints,
      historyOfPresentIllness,
      pastSurgicalHistory,
      pastMedicalHistory,
      personalHistory,
      PhysicalExamination,
      ProvisionalDiagnosis
    } = req.body;
    const medicalHistory: PatientMedicalHistory = {
      MedicalHistoryId: generateId("medhis_"),
      hospitalId: hospitalId?.toString(),
      startingDate: startingDate?.toString(),
      endingDate: endingDate?.toString(),
      ChiefComplaints: ChiefComplaints || "",
      HistoryOfPresentIllness: historyOfPresentIllness || "",
      PastSurgicalHistory: pastSurgicalHistory || [],
      PastMedicalHistory: pastMedicalHistory || [],
      PersonalHistory: personalHistory || [],
      PhysicalExamination: PhysicalExamination || [],
      ProvisionalDiagnosis: ProvisionalDiagnosis || []
    }
    const medicalHistoryColl = await getCollection<IPatientMedicalHistoryArray>("MedicalHistory", null);
    if ((await medicalHistoryColl.find({ patientId: patientId?.toString(), hospitalId: hospitalId?.toString() }))) {

    }
    const medicalHistoryData: IPatientMedicalHistoryArray = {
      patientId: patientId?.toString(),
      medicalHistory: [medicalHistory]
    }
    await medicalHistoryColl.insertOne(medicalHistoryData);
    return res.status(201).json({
      success: true,
      message: "Medical history created successfully",
      data: medicalHistory
    })
  } catch (error: any) {
    console.error("Error in creating medical history", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}; // brainstorming
export const updateMedicalHistory = async (req: Request, res: Response) => {
  try {

  } catch (error: any) {
    console.error("Error in updating medical history", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
};
export const getMedicalHistory = async (req: Request, res: Response) => { };



//PlanOfCareOfPatient -> collectionName
export const createPlanOfCare = async (req: Request, res: Response) => {
  try {
    const {
      patientId,
      hospitalId,
      IpdId,
      Goal_Desired_Result,
      Applicable,
      AdvisedInvestigation,
      AdvisedTreatement,
      PlannedSurgericalIntervention,
      DietaryAdvice,
      PreventiveCare_SpecialPrecautions,
      FoodDrugInteraction,
      Other,
      Consult_Referral,
      Rehabilitive_Aspects,
      Expected_Duration_Of_Stay,
      PhysicalExamination,
      SystematicExamination,
      DiagnosisPreliminary,
      FI_NAL_Diagnosis_At_Time_Of_Discharge,
      Signatures
    }: IPlanOfCare = req.body;

    if (!patientId || !hospitalId || !IpdId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the required fields"
      });
    }

    const planOfCareColl = await getCollection<IPlanOfCare>("PlanOfCareOfPatient", null);
    const planOfCare: IPlanOfCare = {
      patientId: patientId?.toString(),
      hospitalId: hospitalId?.toString(),
      IpdId: IpdId?.toString(),
      Goal_Desired_Result: Goal_Desired_Result || "",
      Applicable: Applicable || [],
      AdvisedInvestigation: AdvisedInvestigation || [],
      AdvisedTreatement: AdvisedTreatement || [],
      PlannedSurgericalIntervention: PlannedSurgericalIntervention || [],
      DietaryAdvice: DietaryAdvice || { consistency: [], type: [] },
      PreventiveCare_SpecialPrecautions: PreventiveCare_SpecialPrecautions || [],
      FoodDrugInteraction: FoodDrugInteraction || [],
      Other: Other || [],
      Consult_Referral: Consult_Referral || [],
      Rehabilitive_Aspects: Rehabilitive_Aspects || [],
      Expected_Duration_Of_Stay: Expected_Duration_Of_Stay || "",
      PhysicalExamination: PhysicalExamination || [],
      SystematicExamination: SystematicExamination || [],
      DiagnosisPreliminary: DiagnosisPreliminary || "",
      FI_NAL_Diagnosis_At_Time_Of_Discharge: FI_NAL_Diagnosis_At_Time_Of_Discharge || "",
      Signatures: Signatures || { patient: "", physician: "", nurse: "" }
    }
    const planOfCareRecord = await planOfCareColl.insertOne(planOfCare);
    return res.status(201).json({
      success: true,
      message: "Plan of care created successfully",
      data: planOfCareRecord
    });

  } catch (error: any) {
    console.error("Error in creating plan of care", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}

export const getPlanOfCare = async (req: Request, res: Response) => {
  try {
    const { id, hospitalId, IpdId } = req.query; // either id(mongoid of document) or [hospitalId and IpdId] should be provided
    let query: { _id?: ObjectId, hospitalId?: string, IpdId?: string } = {};
    if (id && ObjectId.isValid(id as string)) {
      query._id = new ObjectId(id as string);
    } else {
      if (!hospitalId || !IpdId) {
        return res.status(400).json({
          success: false,
          message: "Please provide either id or hospitalId and IpdId"
        });
      }
      query.hospitalId = hospitalId?.toString();
      query.IpdId = IpdId?.toString();
    }

    const planOfCareColl = await getCollection<IPlanOfCare>("PlanOfCareOfPatient", null);
    const planOfCare = await planOfCareColl.findOne(query);
    if (!planOfCare) {
      return res.status(404).json({
        success: false,
        message: "Plan of care not found"
      });
    }
    return res.status(200).json({
      success: true,
      message: "Plan of care fetched successfully",
      data: planOfCare
    });
  } catch (error) {
    console.error("Error in fetching plan of care", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}

export const updatePlanOfCare = async (req: Request, res: Response) => { }
export const deletePlanOfCare = async (req: Request, res: Response) => { }
export const createNutritionAssessmentForm = async (req: Request, res: Response) => { }
export const updateNutritionAssessmentForm = async (req: Request, res: Response) => { }
export const getNutritionAssessmentForm = async (req: Request, res: Response) => { }
export const deleteNutritionAssessmentForm = async (req: Request, res: Response) => { }


export const getDynamicFormData = async (req: Request, res: Response) => {
  try {
    const { hospitalId, formId } = req.query;
    const dynamicFormColl = await getCollection("DIPD", hospitalId?.toString());
    const dynamicForm = await dynamicFormColl.findOne({ formId: formId?.toString() });
    if (!dynamicForm) {
      return res.status(404).json({
        success: false,
        message: "Dynamic form not found"
      });
    }
    return res.status(200).json({
      success: true,
      message: "Dynamic form fetched successfully",
      data: dynamicForm
    });



  } catch (error: any) {
    console.error("Error in getting dynamic form data", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })

  }
}

export const dynamicIpdController = async (req: Request, res: Response) => {
  try {
    console.log("Received request body:", req.body); // Log entire request body

    // If data is directly sent without a data wrapper
    const data = req.body;
    const hospitalId = req.body.hospitalId;



    console.log("Extracted data:", data);
    console.log("Hospital ID:", hospitalId);

    // Validate hospitalId
    if (!hospitalId) {
      console.log("Missing hospitalId");
      return res.status(400).json({
        success: false,
        message: "hospitalId is required"
      });
    }

    // Get the collection
    console.log("Getting collection for hospitalId:", hospitalId);
    const ipdcoll = await getCollection("DIPD", hospitalId.toString());

    // Create document to insert
    const documentToInsert = {
      ...data,


      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log("Document to insert:", documentToInsert);

    // Insert the document
    const search = await ipdcoll.findOne({
      formId: documentToInsert.formId

    });
    if (search) {

      await ipdcoll.findOneAndUpdate({
        _id: search._id
      }, {
        $set: documentToInsert
      })
      return res.status(201).json({
        success: true,
        message: "Dynamic IPD updated successfully",
        data: {
          ...documentToInsert
        }
      });

    }
    const result = await ipdcoll.insertOne(documentToInsert);
    console.log("Insert result:", result);

    // Return the response
    return res.status(201).json({
      success: true,
      message: "Dynamic IPD created successfully",
      data: {
        _id: result.insertedId,
        ...documentToInsert
      }
    });

  } catch (error: any) {
    console.error("Detailed error in dynamic ipd controller:", {
      error: error,
      message: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
}



export const addPatientMovement = async (req: Request, res: Response) => {
  try {
    const { hospitalId, ipdId } = req.query;
    const ipdColl = await getCollection<IIPD>("IPDList", hospitalId?.toString());
    const ipd = await ipdColl.findOne({ _id: new ObjectId(ipdId as string) });
    if (!ipd) {
      return res.status(404).json({
        success: false,
        message: "IPD not found"
      })
    }
    const { movement } = req.body;
    if (!movement) {
      return res.status(400).json({
        success: false,
        message: "Movement data is required"
      })
    }
    let movementData: patientMovements = {
      movementId: generateId("mov_"),
      date: movement.date || new Date().toISOString(),
      time_out: movement.time || new Date().toISOString(),
      Dept_Out: movement.Dept_Out || "",
      Reason_out: movement.Reason_out || "",
      signature_out: movement.signature_out || "",
      time_in: movement.time_in || "",
      Dept_In: movement.Dept_In || "",
      Reason_In: movement.Reason_in || "",
      signature_In: movement.signature_In || "",
    }
    const updateResult = await ipdColl.findOneAndUpdate(
      { _id: new ObjectId(ipdId as string) },
      { $addToSet: { patientMovement: movementData } },
      { returnDocument: "after" }
    );
    if (!updateResult) {
      return res.status(404).json({
        success: false,
        message: "Failed to update patient movement"
      })
    }
    return res.status(200).json({
      success: true,
      message: "Patient movement updated successfully",
      data: updateResult
    })
  } catch (error: any) {
    console.error("Error in updating patient movement", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}



export const updatePatientMovement = async (req: Request, res: Response) => {
  try {
    const { hospitalId, ipdId, movementId } = req.query;
    const ipdColl = await getCollection<IIPD>("IPDList", hospitalId?.toString());
    const ipd = await ipdColl.findOne({ _id: new ObjectId(ipdId as string) });
    if (!ipd) {
      return res.status(404).json({
        success: false,
        message: "IPD not found"
      })
    }
    const { movement } = req.body;
    if (!movement) {
      return res.status(400).json({
        success: false,
        message: "Movement data is required"
      })
    }
    let movementData: patientMovements = {
      movementId: generateId("mov_"),
      date: movement.date || new Date().toISOString(),
      time_out: movement.time || new Date().toISOString(),
      Dept_Out: movement.Dept_Out || "",
      Reason_out: movement.Reason_out || "",
      signature_out: movement.signature_out || "",
      time_in: movement.time_in || "",
      Dept_In: movement.Dept_In || "",
      Reason_In: movement.Reason_in || "",
      signature_In: movement.signature_In || "",
    }
    const updateResult = await ipdColl.findOneAndUpdate(
      { "_id": new ObjectId(ipdId as string), "patientMovement.movementId": movementId as string },
      { $set: { "patientMovement.$": movementData } },
      { returnDocument: "after" }
    );
    if (!updateResult) {
      return res.status(404).json({
        success: false,
        message: "Failed to update patient movement"
      })
    }
    return res.status(200).json({
      success: true,
      message: "Patient movement updated successfully",
      data: updateResult
    })
  } catch (error: any) {
    console.error("Error in updating patient movement", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}


export const deleteVital = async (req: Request, res: Response) => {
  try {
    const { hospitalId, username, vitalId } = req.query;
    if (!hospitalId || !username || !vitalId) {
      return res.status(400).json({
        success: false,
        message: "Please provide hospitalId, username and vitalId",
      });
    }
    const vitalsCollection = await getCollection<IPatient>("PatientList", null);
    const result = await vitalsCollection.findOneAndUpdate(
      { username: username?.toString() },
      { $pull: { vitals: { vitalId: vitalId?.toString() } } },
      { returnDocument: "after" }
    );
    if (!result) {
      return res.status(404).json({
        success: true,
        message: "Patient not found",
      });
    }
    return res.status(201).json({
      success: true,
      message: "Vitals deleted successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error in deleting vitals", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export const addLab = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query; // mongoid of ipd
    const { labId } = req.body; // mongoid of lab

    if (!hospitalId || !id || !labId) {
      return res.status(400).json({
        success: true,
        message: "hospitalId, id and labId are required fields"
      })
    }

    const mongoIpdId = new ObjectId(id.toString());
    const mongoLabId = mongoose.Types.ObjectId.createFromHexString(labId.toString());

    const ipdColl = await getCollection<IIPD>("IPDList", hospitalId.toString());

    const updatedIpd = await ipdColl.findOneAndUpdate(
      {
        _id: mongoIpdId
      },
      {
        $addToSet: {
          labs: mongoLabId.toString()
        }
      },
      {
        returnDocument: "after"
      }
    )

    if (!updatedIpd) {
      return res.status(404).json(
        {
          success: true,
          message: "ipd not found"
        }
      )
    }

    return res.status(200).json(
      {
        success: true,
        message: "lab inserted in the ipd",
        data: updatedIpd
      }
    )
  } catch (error) {
    console.log("error in adding lab: ", error);
    return res.status(500).json(
      {
        success: false,
        messsage: "Internal Server Error"
      }
    )
  }
}