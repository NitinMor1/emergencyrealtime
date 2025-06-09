import { Invoice, IStatus } from "../models/invoicesModel";
import { NextFunction, Request, Response } from "express";
import { getCollection } from "../../../../db/db";
import { ObjectId } from "mongodb";
import { body, validationResult } from "express-validator";
import { generateInvoiceId, genOpdBillId, genTestBillId } from "./ctrlfunc";
import { IBillingDetails } from "../models/opdBillModel";
import { Billing } from "../models/testBillingModel";
import { IHospital } from "../../../auth/HospitalModel";

export const addInvoiceValidationRules = [
  body("customerName")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Customer Name is required"),
  body("totalAmount").isNumeric().withMessage("Amount must be a number"),
  body("date").isISO8601().withMessage("Date must be in ISO8601 format"),

  // Add more validation rules as needed
];

export const addINvoiceValidate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const generateInvoice = async (req: Request, res: Response) => {
  try {
    const {
      hospitalId,
      customerUsername,
      customerName,
      type,
      date,
      totalAmount,
      packaging,
      freight,
      taxable_amount,
      tax_collected_at_source,
      round_off,
      grand_total,
      method_of_payment,
      contents,
      inventoryId,
    } = req.body;
    const invoicecoll = await getCollection<Invoice>(
      "Invoices",
      hospitalId?.toString()
    );
    // empty field must be handled on frontend
    const invoice: Invoice = {
      trnId: await generateInvoiceId(invoicecoll),
      hospitalId: hospitalId,
      customerUsername: customerUsername,
      customerName: customerName,
      type: type,
      date_time: date,
      totalAmount: totalAmount,
      packaging: packaging,
      freight: freight,
      taxable_amount: taxable_amount,
      tax_collected_at_source: tax_collected_at_source,
      round_off: round_off,
      grand_total: grand_total,
      method_of_payment: method_of_payment,
      contents: contents,
      paymentStatus: IStatus.PENDING,
      inventoryId,
    };
    const result = await invoicecoll.insertOne(invoice);
    res.status(201).json({
      success: true,
      message: "Invoice generated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error generating invoice ", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getInvoices = async (req: Request, res: Response) => {
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
    const invoiceColl = await getCollection<Invoice>(
      "Invoices",
      hospitalId?.toString()
    );
    const invoices: Invoice[] = await invoiceColl.find().skip(lowerLimit).limit(limit).toArray();
    if (!invoices) {
      return res.status(404).json({
        success: false,
        message: "No invoices found",
      });
    } else {
      res.status(200).json({
        success: true,
        data: invoices,
      });
    }
  } catch (error: any) {
    console.error("Error getting invoices", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getPendingInvoice = async (req: Request, res: Response) => {
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
    const invoiceColl = await getCollection<Invoice>(
      "Invoices",
      hospitalId?.toString()
    );
    const invoices: Invoice[] = await invoiceColl
      .find({ paymentStatus: IStatus.PENDING })
      .skip(lowerLimit)
      .limit(limit)
      .toArray();
    if (!invoices) {
      return res.status(404).json({
        success: false,
        message: "No invoices found",
      });
    } else {
      res.status(200).json({
        success: true,
        data: invoices,
      });
    }
  } catch (error: any) {
    console.error("Error getting invoices", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updatePendingInvoice = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);

    const invoiceColl = await getCollection<Invoice>(
      "Invoices",
      hospitalId?.toString()
    );
    const invoice = await invoiceColl.findOneAndUpdate(
      { _id: mongoId },
      { $set: { paymentStatus: IStatus.PAID } },
      { returnDocument: "after" }
    );
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    } else {
      return res.status(201).json({
        success: true,
        message: "Invoice updated successfully",
        data: invoice,
      });
    }
  } catch (error: any) {
    console.error("Error updating invoice", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const invoiceColl = await getCollection<Invoice>(
      "Invoices",
      hospitalId?.toString()
    );
    const result = await invoiceColl.deleteOne({
      _id: new ObjectId(id as string),
    });
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    } else {
      res.status(201).json({
        success: true,
        message: "Invoice deleted successfully",
      });
    }
  } catch (error: any) {
    console.error("Error deleting invoice", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateInvoice = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);

    const invoicecoll = await getCollection<Invoice>(
      "Invoices",
      hospitalId?.toString()
    );
    const invoice = await invoicecoll.findOneAndUpdate(
      { _id: mongoId },
      { $set: req.body },
      { returnDocument: "after" }
    );
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    } else {
      return res.status(201).json({
        success: true,
        message: "Invoice updated successfully",
        data: invoice,
      });
    }
  } catch (error: any) {
    console.error("Error updating invoice", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updatePendingInvoices = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const invoicecoll = await getCollection<Invoice>(
      "Invoices",
      hospitalId?.toString()
    );
    const invoice = await invoicecoll.findOneAndUpdate(
      { _id: mongoId },
      { $set: { paymentStatus: IStatus.PAID } }
    );
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "No pending invoices found",
      });
    } else {
      return res.status(201).json({
        success: true,
        message: "Pending invoice updated successfully",
      });
    }
  } catch (error: any) {
    console.error("Error updating pending invoice", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const generateOpdBills = async (req: Request, res: Response) => {
  try {
    const {
      hospitalId,
      transactionId,
      totalAmount,
      paymentMethod,
      insuranceDetails,
      discount,
      finalAmount,
      appointmentId,
      notes,
      billingDate_time,
    } = req.body;

    const opdBillColl = await getCollection<IBillingDetails>(
      "Incomes",
      hospitalId?.toString()
    );
    const opdBill: IBillingDetails = {
      hospitalId,
      appointmentId,
      transactionId: transactionId || "",
      billingId: await genOpdBillId(opdBillColl),
      totalAmount,
      paymentMethod,
      insuranceDetails,
      discount,
      finalAmount,
      billingDate_time: billingDate_time ||  new Date().toISOString(),
      notes,
    };
    const result = await opdBillColl.insertOne(opdBill);

    const hospitalColl = await getCollection<IHospital>("Hospitals", null);
    const hospital = await hospitalColl.findOne({
      hospitalId: hospitalId as string,
    })
    const deductionAmount = hospital?.ratePerBill?.ratePerOpdBill || 0;
    if(deductionAmount){
      const updatedWallet = (hospital?.wallet || 0) - deductionAmount;
      await hospitalColl.findOneAndUpdate(
        { hospitalId: hospitalId as string },
        { $set: { wallet: updatedWallet } }
      );
    }
    return res.status(201).json({
      success: true,
      message: "Opd bill generated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error generating opd bills", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getOpdBillByid = async (req: Request, res: Response) => {
  try {
    const { hospitalId, appointmentId } = req.query;

    const opdBillColl = await getCollection<IBillingDetails>(
      "Incomes",
      hospitalId?.toString()
    );
    const opdBill = await opdBillColl.findOne({ appointmentId: appointmentId });
    if (!opdBill) {
      return res.status(404).json({
        success: false,
        message: "Opd bill not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: opdBill,
    });


  } catch (error: any) {

    console.error("Error getting opd bill by id", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
}

export const getOpdBills = async (req: Request, res: Response) => {
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
    const invoiceColl = await getCollection<IBillingDetails>(
      "Incomes",
      hospitalId?.toString()
    );
    const opdBill: IBillingDetails[] = await invoiceColl
      .find({
        appointmentId: { $exists: true },
        billingId: { $exists: true },
      })
      .skip(lowerLimit)
      .limit(limit)
      .toArray();
    if (!opdBill) {
      return res.status(404).json({
        success: false,
        message: "No invoices found",
      });
    } else {
      res.status(200).json({
        success: true,
        data: opdBill,
      });
    }
  } catch (error: any) {
    console.error("Error getting opd bills", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateOpdBill = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const opdBillColl = await getCollection<IBillingDetails>(
      "Incomes",
      hospitalId?.toString()
    );
    const opdBill = await opdBillColl.findOneAndUpdate(
      {
        _id: mongoId,
      },
      { $set: req.body },
      { returnDocument: "after" }
    );

    if (!opdBill) {
      return res.status(404).json({
        success: false,
        message: "Opd bill not found",
      });
    }
    return res.status(201).json({
      success: true,
      message: "Opd bill updated successfully",
      data: opdBill,
    });
  } catch (error: any) {
    console.error("Error updating opd bill", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export const generateTestBill = async (req: Request, res: Response) => {
  try{
      let {
        hospitalId,
        transactionId,
        invoiceId,
        patientId,
        testOrderId,
        payerType,
        paymentStatus,
        accountingSystemId,
        finalAmount,
        discount,
        billingDate_time,
        insuranceDetails,
        isPaid
      } = req.body;
      if(!patientId || !testOrderId || !payerType || !paymentStatus){
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }
      const testBillColl = await getCollection<Billing>(
        "Incomes",
        hospitalId?.toString()
      );
      let deconstructedData: Billing = {
        hospitalId,
        transactionId: transactionId ?? `txn_${new Date().toISOString().replace(/[^0-9]/g, "")}${testOrderId}`,
        invoiceId: await genTestBillId(testBillColl),
        patientId,
        testOrderId,
        payerType,
        paymentStatus,
        accountingSystemId,
        finalAmount: parseFloat(finalAmount) || parseFloat("0"),
        discount: discount ?? 0,
        billingDate_time: billingDate_time ?? new Date().toISOString(),
        insuranceDetails: insuranceDetails ?? {},
        isPaid: isPaid ?? false,
      }
      // Calculate final amount for each line item and the total final amount 
      // confused in this formula
      // deconstructedData.lineItems.forEach((item: BillingLineItem) => {
      //   item.finalAmount = parseFloat((item.unitPrice * item.quantity - item.discount).toFixed(2));
      // })
      deconstructedData.finalAmount = parseFloat(
        (deconstructedData.finalAmount - (deconstructedData.discount ?? 0)).toFixed(2))

      const result = await testBillColl.insertOne(deconstructedData);

      const hospitalColl = await getCollection<IHospital>("Hospitals", null);
      const hospital = await hospitalColl.findOne({hospitalId: hospitalId as string});
      const deductionAmount = hospital?.ratePerBill?.ratePerTestBill ?? 0;
          
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
        message: "Test bill generated successfully",
        data: result,
      });
  }catch(error:any){
    console.error("Error generating test bill", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export const getTestBillById = async (req: Request, res: Response) => {
  try {
    const { hospitalId, testId } = req.query;
    const testBillColl = await getCollection<Billing>(
      "Incomes",
      hospitalId?.toString()
    );
    const testBill = await testBillColl.findOne({ 
      testOrderId: testId as string
    });
    if (!testBill) {
      return res.status(404).json({
        success: false,
        message: "Test bill not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: testBill,
    });
  } catch (error: any) {
    console.error("Error getting test bill by id", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getTestBills = async (req: Request, res: Response) => {
  try{
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
    const testBillColl = await getCollection<Billing>(
      "Incomes",
      hospitalId?.toString()
    );
    const testBill: Billing[] = await testBillColl.find().skip(lowerLimit).limit(limit).toArray();
    if (!testBill) {
      return res.status(404).json({
        success: false,
        message: "No test bills found",
      });
    } else {
      res.status(200).json({
        success: true,
        data: testBill,
      });
    }
  }catch(error:any){
    console.error("Error getting test bills", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateTestBill = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const data = req.body;
    const mongoId = new ObjectId(id as string);
    const testBillColl = await getCollection<Billing>(
      "Incomes",
      hospitalId?.toString()
    );
    const testBill = await testBillColl.findOneAndUpdate(
      {
        _id: mongoId,
      },
      { $set: data },
      { returnDocument: "after" }
    );
    if (!testBill) {
      return res.status(404).json({
        success: false,
        message: "Test bill not found",
      });
    }
    return res.status(201).json({
      success: true,
      message: "Test bill updated successfully",
      data: testBill,
    });
  } catch (error: any) {
    console.error("Error updating test bill", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};