import { Request, Response } from "express";
import { getCollection } from "../../../../db/db";
import { ObjectId } from "mongodb";
import { genIpdBillId } from "./ctrlfunc";
import {
  IIpdBillingDetail,
  medicines,
  procedures,
  roomType,
  services,
} from "../models/ipdBillModel";
import { generateBillingId } from "../../../../utils/generators/idGenerator";
import { IRateType } from "../../../ipd/ipdModel";
import { IHospital } from "../../../auth/HospitalModel";
import { Billing } from "../models/testBillingModel";

export const addIpdBill = async (req: Request, res: Response) => {
  try {
    const { hospitalId, billingDate_time, billing, ipdId, partPayment } = req.body;
    const ipdBillColl = await getCollection<IIpdBillingDetail>(
      "IpdBills",
      hospitalId?.toString()
    );
    const ipdBill: IIpdBillingDetail = {
      hospitalId,
      billId: await genIpdBillId(ipdBillColl),
      billingDate_time,
      billing: {
        roomCharges: billing.room || {
          type: roomType.PRIVATE,
          dailyRate: 0,
          days: 0,
        },
        consultationCharges: billing.consultationCharges || {
          visits: 0,
          ratePerVisit: 0,
        },
        services: billing.services || [],
        medicines: billing.medicines || [],
        procedures: billing.procedures || [],
        taxes: billing.taxes || { gst: 0, otherTaxes: 0 },
        testBills: billing.testBills || [],
        paymentMethod: billing.paymentMethod || "",
        insuranceCoverage: billing.insuranceCoverage || {
          provider: "",
          policyNumber: "",
          coverageAmount: 0,
        },
        paymentStatus: "Pending",
        Rate_Type: billing.Rate_Type || IRateType.NABHPrice,
        
      },
      finalAmount: 0,
      ipdId: ipdId,
      partPayment: partPayment || {
        paidAmount: 0,
        remainingAmount: 0,
      }
    };
    const result = await ipdBillColl.insertOne(ipdBill);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Ipd bill not added",
      });
    }
    return res.status(201).json({
      success: true,
      message: "Ipd bill added successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error adding ipd bill", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const deleteIpdBill = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const ipdBillColl = await getCollection<IIpdBillingDetail>(
      "IpdBills",
      hospitalId?.toString()
    );
    const ipdBill = await ipdBillColl.findOneAndDelete({ _id: mongoId });
    if (!ipdBill) {
      return res.status(404).json({
        success: false,
        message: "Ipd bill not found",
      });
    }
    const incomeColl = await getCollection<IIpdBillingDetail>(
      "Incomes",
      hospitalId?.toString()
    );
    await incomeColl.findOneAndDelete({ _id: mongoId });
    return res.status(200).json({
      success: true,
      message: "Ipd bill deleted successfully",
      data: ipdBill,
    });
  } catch (error: any) {
    console.error("Error deleting ipd bill", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const genIpdBill = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const ipdBillColl = await getCollection<IIpdBillingDetail>(
      "IpdBills",
      hospitalId?.toString()
    );

    const ipdBill = await ipdBillColl.findOne({ _id: mongoId });

    if (!ipdBill) {
      return res.status(404).json({
        success: false,
        message: "Ipd bill not found",
      });
    }

    const billing = ipdBill.billing;

    const roomCharges =
      (billing.roomCharges?.dailyRate || 0) * (billing.roomCharges?.days || 0);

    const consultationCharges =
      (billing.consultationCharges?.visits || 0) *
      (billing.consultationCharges?.ratePerVisit || 0);

    // Add checks for array existence and empty arrays
    const services = Array.isArray(billing.services) && billing.services.length > 0
      ? billing.services.reduce(
          (acc: number, service: services) => {
            return acc + (service.rate || 0) * (service.quantity || 0);
          },
          0
        )
      : 0;

    const medicines = Array.isArray(billing.medicines) && billing.medicines.length > 0
      ? billing.medicines.reduce(
          (acc: number, medicine: medicines) => {
            return acc + (medicine.unitPrice || 0) * (medicine.quantity || 0);
          },
          0
        )
      : 0;

    const procedures = Array.isArray(billing.procedures) && billing.procedures.length > 0
      ? billing.procedures.reduce(
          (acc: number, procedure: procedures) => {
            return acc + (procedure.charge || 0);
          },
          0
        )
      : 0;

    const testBills = Array.isArray(billing.testBills) && billing.testBills.length > 0
      ? billing.testBills.reduce(
          (acc: number, testBill: { amount: number }) => {
            return acc + (testBill.amount || 0);
          },
          0
        )
      : 0;

    const taxes = (billing.taxes?.gst || 0) + (billing.taxes?.otherTaxes || 0);
    const insuranceCoverage = billing.insuranceCoverage?.coverageAmount || 0;

    const finalAmount =
      roomCharges +
      consultationCharges +
      services +
      medicines +
      procedures +
      testBills +
      taxes -
      insuranceCoverage;

    ipdBill.finalAmount = finalAmount;
    await ipdBillColl.findOneAndUpdate(
      { _id: mongoId },
      { $set: { finalAmount } }
    );

    // for income collection
    const incomeColl = await getCollection<IIpdBillingDetail>(
      "Incomes",
      hospitalId?.toString()
    );
    const incomeData = { ...ipdBill };
    delete (incomeData as any)._id;  // Remove _id to avoid duplicate key error
    await incomeColl.insertOne(incomeData);

    const hospitalColl = await getCollection<IHospital>("Hospitals", null);
    const hospital = await hospitalColl.findOne({hospitalId: hospitalId as string});
    const deductionAmount = hospital?.ratePerBill?.ratePerIpdBill || 0;
    
    // Deduct the amount from the hospital's wallet 
    if (deductionAmount) {
      const updatedWallet = (hospital?.wallet || 0) - deductionAmount;
      await hospitalColl.findOneAndUpdate(
      { hospitalId: hospitalId as string },
      { $set: { wallet: updatedWallet } }
      );
    }

    return res.status(201).json({
      success: true,
      message: "Ipd bill generated successfully",
      data: ipdBill,
    });
  } catch (error: any) {
    console.error("Error generating IPD bill", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getIpdBills = async (req: Request, res: Response) => {
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
    const ipdBillColl = await getCollection<IIpdBillingDetail>(
      "IpdBills",
      hospitalId?.toString()
    );
    const ipdBill: IIpdBillingDetail[] = await ipdBillColl.find().skip(lowerLimit).limit(limit).toArray();
    if (!ipdBill) {
      return res.status(404).json({
        success: false,
        message: "No invoices found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Ipd bills retrieved successfully",
      data: ipdBill,
    });
  } catch (error: any) {
    console.error("Error getting ipd bills", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateIpdBill = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const ipdBillColl = await getCollection<IIpdBillingDetail>(
      "IpdBills",
      hospitalId?.toString()
    );

    const result = await ipdBillColl.findOne<IIpdBillingDetail>({
      _id: mongoId,
    });
    const ipdBill = await ipdBillColl.findOneAndUpdate(
      {
        _id: mongoId,
      },
      { $set: { billing: { ...result?.billing, ...req.body } } },
      { returnDocument: "after" }
    );

    if (!ipdBill) {
      return res.status(404).json({
        success: false,
        message: "Ipd bill not found",
      });
    }
    return res.status(201).json({
      success: true,
      message: "Ipd bill updated successfully",
      data: ipdBill,
    });
  } catch (error: any) {
    console.error("Error updating ipd bill", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const addService = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const ipdBillColl = await getCollection<IIpdBillingDetail>(
      "IpdBills",
      hospitalId?.toString()
    );
    const ipdBill = await ipdBillColl.findOne({ _id: mongoId });
    if (!ipdBill) {
      return res.status(404).json({
        success: false,
        message: "Ipd bill not found",
      });
    }

    const { services } = ipdBill.billing;
    services.push({
      serviceId: generateBillingId("service_"),
      name: req.body.name,
      rate: req.body.rate,
      quantity: req.body.quantity,
    });

    const result = await ipdBillColl.findOneAndUpdate(
      { _id: mongoId },
      { $set: { "billing.services": services } },
      { returnDocument: "after" }
    );

    return res.status(201).json({
      success: true,
      message: "Service added successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error adding services", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id, serviceId } = req.query;
    const mongoId = new ObjectId(id as string);
    const ipdBillColl = await getCollection<IIpdBillingDetail>(
      "IpdBills",
      hospitalId?.toString()
    );
    const ipdBill = await ipdBillColl.findOne({ _id: mongoId });
    if (!ipdBill) {
      return res.status(404).json({
        success: false,
        message: "Ipd bill not found",
      });
    }

    const { services } = ipdBill.billing;
    for (let service of services) {
      if (service.serviceId === serviceId) {
        service.name = req.body.name ?? service.name;
        service.rate = req.body.rate ?? service.rate;
        service.quantity = req.body.quantity ?? service.quantity;
        break;
      } else {
        return res.status(404).json({
          success: false,
          message: "Service not found",
        });
      }
    }

    const result = await ipdBillColl.findOneAndUpdate(
      { _id: mongoId },
      { $set: { "billing.services": services } },
      { returnDocument: "after" }
    );

    return res.status(201).json({
      success: true,
      message: "Service updated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error updating services", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id, serviceId } = req.query;
    const mongoId = new ObjectId(id as string);
    const ipdBillColl = await getCollection<IIpdBillingDetail>(
      "IpdBills",
      hospitalId?.toString()
    );
    const ipdBill = await ipdBillColl.findOne({ _id: mongoId });
    if (!ipdBill) {
      return res.status(404).json({
        success: false,
        message: "Ipd bill not found",
      });
    }

    const { services } = ipdBill.billing;
    const filteredServices = services.filter(
      (service) => service.serviceId !== serviceId
    );

    const result = await ipdBillColl.findOneAndUpdate(
      { _id: mongoId },
      { $set: { "billing.services": filteredServices } },
      { returnDocument: "after" }
    );

    return res.status(201).json({
      success: true,
      message: "Service deleted successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error deleting services", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const addMedicine = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const ipdBillColl = await getCollection<IIpdBillingDetail>(
      "IpdBills",
      hospitalId?.toString()
    );
    const ipdBill = await ipdBillColl.findOne({ _id: mongoId });
    if (!ipdBill) {
      return res.status(404).json({
        success: false,
        message: "Ipd bill not found",
      });
    }

    const { medicines } = ipdBill.billing;
    medicines.push({
      medicineId: generateBillingId("medicine_"),
      name: req.body.name,
      unitPrice: req.body.unitPrice,
      quantity: req.body.quantity,
    });

    const result = await ipdBillColl.findOneAndUpdate(
      { _id: mongoId },
      { $set: { "billing.medicines": medicines } },
      { returnDocument: "after" }
    );

    return res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error adding medicines", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateMedicine = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id, medicineId } = req.query;
    const mongoId = new ObjectId(id as string);
    const ipdBillColl = await getCollection<IIpdBillingDetail>(
      "IpdBills",
      hospitalId?.toString()
    );
    const ipdBill = await ipdBillColl.findOne({ _id: mongoId });
    if (!ipdBill) {
      return res.status(404).json({
        success: false,
        message: "Ipd bill not found",
      });
    }

    const { medicines } = ipdBill.billing;
    for (let medicine of medicines) {
      if (medicine.medicineId === medicineId) {
        medicine.name = req.body.name ?? medicine.name;
        medicine.unitPrice = req.body.unitPrice ?? medicine.unitPrice;
        medicine.quantity = req.body.quantity ?? medicine.quantity;
        break;
      } else {
        return res.status(404).json({
          success: false,
          message: "Medicine not found",
        });
      }
    }

    const result = await ipdBillColl.findOneAndUpdate(
      { _id: mongoId },
      { $set: { "billing.medicines": medicines } },
      { returnDocument: "after" }
    );

    return res.status(201).json({
      success: true,
      message: "Medicine updated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error updating services", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const deleteMedicine = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id, medicineId } = req.query;
    const mongoId = new ObjectId(id as string);
    const ipdBillColl = await getCollection<IIpdBillingDetail>(
      "IpdBills",
      hospitalId?.toString()
    );
    const ipdBill = await ipdBillColl.findOne({ _id: mongoId });
    if (!ipdBill) {
      return res.status(404).json({
        success: false,
        message: "Ipd bill not found",
      });
    }

    const { medicines } = ipdBill.billing;
    const filteredMedicines = medicines.filter(
      (medicine) => medicine.medicineId !== medicineId
    );

    const result = await ipdBillColl.findOneAndUpdate(
      { _id: mongoId },
      { $set: { "billing.medicines": filteredMedicines } },
      { returnDocument: "after" }
    );

    return res.status(201).json({
      success: true,
      message: "Medicine deleted successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error deleting medicines", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const addProcedure = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const ipdBillColl = await getCollection<IIpdBillingDetail>(
      "IpdBills",
      hospitalId?.toString()
    );
    const ipdBill = await ipdBillColl.findOne({ _id: mongoId });
    if (!ipdBill) {
      return res.status(404).json({
        success: false,
        message: "Ipd bill not found",
      });
    }

    const { procedures } = ipdBill.billing;
    procedures.push({
      procedureId: generateBillingId("procedure_"),
      name: req.body.name,
      charge: req.body.charge,
    });

    const result = await ipdBillColl.findOneAndUpdate(
      { _id: mongoId },
      { $set: { "billing.procedures": procedures } },
      { returnDocument: "after" }
    );

    return res.status(201).json({
      success: true,
      message: "Procedure added successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error adding procedures", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateProcedure = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id, procedureId } = req.query;
    const mongoId = new ObjectId(id as string);
    const ipdBillColl = await getCollection<IIpdBillingDetail>(
      "IpdBills",
      hospitalId?.toString()
    );
    const ipdBill = await ipdBillColl.findOne({ _id: mongoId });
    if (!ipdBill) {
      return res.status(404).json({
        success: false,
        message: "Ipd bill not found",
      });
    }

    const { procedures } = ipdBill.billing;
    for (let procedure of procedures) {
      if (procedure.procedureId === procedureId) {
        procedure.name = req.body.name ?? procedure.name;
        procedure.charge = req.body.charge ?? procedure.charge;
        break;
      } else {
        return res.status(404).json({
          success: false,
          message: "Procedure not found",
        });
      }
    }

    const result = await ipdBillColl.findOneAndUpdate(
      { _id: mongoId },
      { $set: { "billing.procedures": procedures } },
      { returnDocument: "after" }
    );

    return res.status(201).json({
      success: true,
      message: "Procedure updated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error updating services", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const deleteProcedure = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id, procedureId } = req.query;
    const mongoId = new ObjectId(id as string);
    const ipdBillColl = await getCollection<IIpdBillingDetail>(
      "IpdBills",
      hospitalId?.toString()
    );
    const ipdBill = await ipdBillColl.findOne({ _id: mongoId });
    if (!ipdBill) {
      return res.status(404).json({
        success: false,
        message: "Ipd bill not found",
      });
    }

    const { procedures } = ipdBill.billing;
    const filteredProcedures = procedures.filter(
      (procedure) => procedure.procedureId !== procedureId
    );

    const result = await ipdBillColl.findOneAndUpdate(
      { _id: mongoId },
      { $set: { "billing.procedures": filteredProcedures } },
      { returnDocument: "after" }
    );

    return res.status(201).json({
      success: true,
      message: "Procedure deleted successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error deleting procedures", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateRoomCharges = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const ipdBillColl = await getCollection<IIpdBillingDetail>(
      "IpdBills",
      hospitalId?.toString()
    );
    const ipdBill = await ipdBillColl.findOne({ _id: mongoId });
    if (!ipdBill) {
      return res.status(404).json({
        success: false,
        message: "Ipd bill not found",
      });
    }

    const { roomCharges } = ipdBill.billing;
    roomCharges.type = req.body.type ?? roomCharges.type;
    roomCharges.dailyRate = req.body.dailyRate ?? roomCharges.dailyRate;
    roomCharges.days = req.body.days ?? roomCharges.days;

    const result = await ipdBillColl.findOneAndUpdate(
      { _id: mongoId },
      { $set: { "billing.roomCharges": roomCharges } },
      { returnDocument: "after" }
    );

    return res.status(201).json({
      success: true,
      message: "Room charges updated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error updating room charges", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateConsultationCharges = async (
  req: Request,
  res: Response
) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const ipdBillColl = await getCollection<IIpdBillingDetail>(
      "IpdBills",
      hospitalId?.toString()
    );
    const ipdBill = await ipdBillColl.findOne({ _id: mongoId });
    if (!ipdBill) {
      return res.status(404).json({
        success: false,
        message: "Ipd bill not found",
      });
    }

    const { consultationCharges } = ipdBill.billing;
    consultationCharges.visits = req.body.visits ?? consultationCharges.visits;
    consultationCharges.ratePerVisit =
      req.body.ratePerVisit ?? consultationCharges.ratePerVisit;

    const result = await ipdBillColl.findOneAndUpdate(
      { _id: mongoId },
      { $set: { "billing.consultationCharges": consultationCharges } },
      { returnDocument: "after" }
    );

    return res.status(201).json({
      success: true,
      message: "Consultation Charges updated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error updating consultation charges", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateTaxes = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const ipdBillColl = await getCollection<IIpdBillingDetail>(
      "IpdBills",
      hospitalId?.toString()
    );
    const ipdBill = await ipdBillColl.findOne({ _id: mongoId });
    if (!ipdBill) {
      return res.status(404).json({
        success: false,
        message: "Ipd bill not found",
      });
    }

    const { taxes } = ipdBill.billing;
    taxes.gst = req.body.gst ?? taxes.gst;
    taxes.otherTaxes = req.body.otherTaxes ?? taxes.otherTaxes;

    const result = await ipdBillColl.findOneAndUpdate(
      { _id: mongoId },
      { $set: { "billing.taxes": taxes } },
      { returnDocument: "after" }
    );

    return res.status(201).json({
      success: true,
      message: "Taxes updated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error updating taxes", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateInsuranceCoverage = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const ipdBillColl = await getCollection<IIpdBillingDetail>(
      "IpdBills",
      hospitalId?.toString()
    );
    const ipdBill = await ipdBillColl.findOne({ _id: mongoId });
    if (!ipdBill) {
      return res.status(404).json({
        success: false,
        message: "Ipd bill not found",
      });
    }

    const { insuranceCoverage } = ipdBill.billing;
    insuranceCoverage.provider =
      req.body.provider ?? insuranceCoverage.provider;
    insuranceCoverage.policyNumber =
      req.body.policyNumber ?? insuranceCoverage.policyNumber;
    insuranceCoverage.coverageAmount =
      req.body.coverageAmount ?? insuranceCoverage.coverageAmount;

    const result = await ipdBillColl.findOneAndUpdate(
      { _id: mongoId },
      { $set: { "billing.insuranceCoverage": insuranceCoverage } },
      { returnDocument: "after" }
    );

    return res.status(201).json({
      success: true,
      message: "Insurance Coverage updated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error updating insurance coverage", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getIpdBillsById = async (req: Request, res: Response) => {
  try {
    const { hospitalId, ipdId } = req.query;
    const mongoId = new ObjectId(ipdId as string);
    const ipcBillColl = await getCollection<IIpdBillingDetail>("IpdBills", hospitalId?.toString());
    const ipdBill = await ipcBillColl.findOne({ ipdId: mongoId?.toString() });
    if (!ipdBill) {
      return res.status(404).json({
        success: false,
        message: "No ipd bill found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Ipd bill retrieved successfully",
      data: ipdBill,
    });
  } catch (error: any) {
    console.error("Error getting ipd bills by id", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}


export const getTestBillByMongoId = async (req: Request, res: Response) => {
  try{
      const { hospitalId, id } = req.query;
      const mongoId = new ObjectId(id as string);
      const testBillColl = await getCollection<Billing>("Incomes", hospitalId?.toString());
      const testBill = await testBillColl.findOne({ _id: mongoId });
      if(!testBill){
          return res.status(404).json({
              success: false,
              message: "Test bill not found",
          });
      }
      return res.status(200).json({
          success: true,
          message: "Test bill retrieved successfully",
          data: testBill,
      });
  }catch(error:any){
    console.error("Error getting test bill by id", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}