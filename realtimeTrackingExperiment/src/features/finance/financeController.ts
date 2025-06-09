import { getCollection } from "../../db/db";
import { Request, Response } from "express";
import { IExpense, IFinance, IIncome, IType } from "./financeModel";
import { IEmployee } from "../resource/HRMS/hrModel";
import { Invoice } from "../account/invoices/models/invoicesModel";
import { ObjectId } from "mongodb";
import { Billing } from "../account/invoices/models/testBillingModel";
import { IIpdBillingDetail } from "../account/invoices/models/ipdBillModel";
import { IBillingDetails } from "../account/invoices/models/opdBillModel";
import { IHospital } from "../auth/HospitalModel";
export const getTotalFinance = async (req: Request, res: Response) => {
  try {
    const hospitalId = req.query.hospitalId?.toString();

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required"
      });
    }

    // Use Promise.all to fetch data concurrently
    const [employees, invoices, expenses, incomes] = await Promise.all([
      getCollection<IEmployee>("Employee", hospitalId).then(coll => coll.find().toArray()),
      getCollection<Invoice>("Invoices", hospitalId).then(coll => coll.find().toArray()),
      getCollection<IExpense>("Expenses", hospitalId).then(coll => coll.find().toArray()),
      getCollection<IIncome>("Incomes", hospitalId).then(coll => coll.find().toArray())
    ]);

    // Use reduce instead of for...of loops for better performance
    const employeeTotals = employees.reduce((acc, emp) => ({
      pending: acc.pending + Number(emp.HR?.total_payable_salary || 0),
      outgoing: acc.outgoing + Number(emp.HR?.total_paid_salary || 0)
    }), { pending: 0, outgoing: 0 });

    const invoiceTotals = invoices.reduce((acc, inv) => {
      const amount = Number(inv.grand_total || 0);
      return {
        pending: acc.pending + (inv.paymentStatus === "pending" ? amount : 0),
        outgoing: acc.outgoing + (inv.paymentStatus !== "pending" ? amount : 0)
      };
    }, { pending: 0, outgoing: 0 });

    const expenseTotals = expenses.reduce((acc, exp) => {
      const amount = Number(exp.amount || 0);
      return {
        pending: acc.pending + (exp.status === "pending" ? amount : 0),
        outgoing: acc.outgoing + (exp.status !== "pending" ? amount : 0)
      };
    }, { pending: 0, outgoing: 0 });

    const totalIncomeAmount = incomes.reduce((sum, inc) =>
        sum + Number(inc.finalAmount || 0), 0);

    const totalPendingAmount = parseFloat((employeeTotals.pending + invoiceTotals.pending + expenseTotals.pending).toFixed(2));
    const totalOutgoingAmount = parseFloat((employeeTotals.outgoing + invoiceTotals.outgoing + expenseTotals.outgoing).toFixed(2));
    const totalIncomeAmountRounded = parseFloat(totalIncomeAmount.toFixed(2));
    const netProfit = parseFloat((totalIncomeAmountRounded - totalOutgoingAmount).toFixed(2));

    const financeColl = await getCollection<IFinance>("Finance", hospitalId);
    const finance = await financeColl.findOneAndUpdate(
        { hospitalId },
        {
          $set: {
            amountPending: totalPendingAmount,
            outgoingAmount: totalOutgoingAmount,
            income: totalIncomeAmount,
            netProfit
          }
        },
        { returnDocument: "after", upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Finance fetched successfully",
      data: finance
    });

  } catch (error) {
    console.error("Error in calculating finance:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


export const getLiabilities = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.query;

    const liabilitiesColl = await getCollection<IExpense>(
      "Expenses",
      hospitalId?.toString()
    );

    const liabilities: IExpense[] = await liabilitiesColl
      .find({ type: IType.LIABILITY })
      .toArray();

    return res.status(200).json({
      success: true,
      message: "Liabilities fetched successfully",
      data: liabilities,
    });
  } catch (error: any) {
    console.error("Error in fetching liabilities", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAssets = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.query;

    const assetsColl = await getCollection<IExpense>(
      "Expenses",
      hospitalId?.toString()
    );

    const assets: IExpense[] = await assetsColl
      .find({ type: IType.ASSET })
      .toArray();

    return res.status(200).json({
      success: true,
      message: "Assets fetched successfully",
      data: assets,
    });
  } catch (error: any) {
    console.error("Error in fetching assets", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getIncomes = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.query;

    const incomeColl = await getCollection<IIncome>(
      "Incomes",
      hospitalId?.toString()
    );

    const incomes: IIncome[] = await incomeColl.find().toArray();

    return res.status(200).json({
      success: true,
      message: "Incomes fetched successfully",
      data: incomes,
    });
  } catch (error: any) {
    console.error("Error in fetching incomes", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.query;

    const expenseColl = await getCollection<IExpense>(
      "Expenses",
      hospitalId?.toString()
    );

    const expenses: IExpense[] = await expenseColl.find().toArray();

    return res.status(200).json({
      success: true,
      message: "Expenses fetched successfully",
      data: expenses,
    });
  } catch (error: any) {
    console.error("Error in fetching expenses", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const addIncome = async (req: Request, res: Response) => {
  try {
    const { hospitalId, name, description, finalAmount } = req.body;

    const incomesColl = await getCollection<IIncome>(
      "Incomes",
      hospitalId?.toString()
    );

    const newIncome = await incomesColl.insertOne({
      hospitalId,
      name,
      description,
      finalAmount,
    });

    if (!newIncome) {
      return res.status(400).json({
        success: false,
        message: "Error in adding income",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Income added successfully",
      data: newIncome,
    });
  } catch (error: any) {
    console.error("Error in adding income", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const addExpense = async (req: Request, res: Response) => {
  try {
    const { hospitalId, name, type, description, amount, status } = req.body;

    const incomesColl = await getCollection<IExpense>(
      "Expenses",
      hospitalId?.toString()
    );

    const newExpense = await incomesColl.insertOne({
      hospitalId,
      name,
      type,
      description,
      amount,
      status,
    });

    if (!newExpense) {
      return res.status(400).json({
        success: false,
        message: "Error in adding expense",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expense added successfully",
      data: newExpense,
    });
  } catch (error: any) {
    console.error("Error in adding expense", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateIncome = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);

    const incomeColl = await getCollection<IIncome>(
      "Incomes",
      hospitalId?.toString()
    );

    const updatedIncome = await incomeColl.findOneAndUpdate(
      { _id: mongoId },
      {
        $set: { ...req.body },
      },
      { returnDocument: "after" }
    );

    if (!updatedIncome) {
      return res.status(400).json({
        success: false,
        message: "Error in updating income",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Income updated successfully",
      data: updatedIncome,
    });
  } catch (error: any) {
    console.error("Error in updating income", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);

    const assetsColl = await getCollection<IExpense>(
      "Expenses",
      hospitalId?.toString()
    );

    const updatedExpense = await assetsColl.findOneAndUpdate(
      { _id: mongoId },
      {
        $set: { ...req.body },
      },
      { returnDocument: "after" }
    );

    if (!updatedExpense) {
      return res.status(400).json({
        success: false,
        message: "Error in updating expense",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: updatedExpense,
    });
  } catch (error: any) {
    console.error("Error in updating expense", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteIncome = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);

    const assetsColl = await getCollection<IIncome>(
      "Incomes",
      hospitalId?.toString()
    );

    const deletedIncome = await assetsColl.findOneAndDelete({ _id: mongoId });

    if (!deletedIncome) {
      return res.status(400).json({
        success: false,
        message: "Error in deleting income",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Income deleted successfully",
      data: deletedIncome,
    });
  } catch (error: any) {
    console.error("Error in deleting income", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);

    const assetsColl = await getCollection<IExpense>(
      "Expenses",
      hospitalId?.toString()
    );

    const deletedExpense = await assetsColl.findOneAndDelete({ _id: mongoId });

    if (!deletedExpense) {
      return res.status(400).json({
        success: false,
        message: "Error in deleting expense",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
      data: deletedExpense,
    });
  } catch (error: any) {
    console.error("Error in deleting expense", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getNumberOfDifferentBills = async (req: Request, res: Response) => {
  try{
      const { hospitalId } = req.query;
      const incomeColl = await getCollection<Billing>(
        "Incomes",
        hospitalId?.toString()
      );
      const testIncome = await incomeColl.find({}).toArray();
      if (!testIncome) {
        return res.status(404).json({
          success: false,
          message: "No bills found",
        });
      }
      let ipdBills = 0 , opdBills = 0 , testBills = 0;
      let ipdTotalAmount = 0, opdTotalAmount = 0, testTotalAmount = 0;
      testIncome.forEach((testIncome) => {
        if(testIncome.invoiceId){
          testBills++;
          testTotalAmount += testIncome.finalAmount;
        }
      })
      const ipdIncomeColl = await getCollection<IIpdBillingDetail>(
        "Incomes",
        hospitalId?.toString()
      );
      const ipdIncome = await ipdIncomeColl.find({}).toArray();
      if (!ipdIncome) {
        return res.status(404).json({
          success: false,
          message: "No bills found",
        });
      }
      ipdIncome.forEach((ipdIncome) => {
        if(ipdIncome.ipdId){
          ipdBills++;
          ipdTotalAmount += ipdIncome.finalAmount;
        }
      })
      const opdIncomeColl = await getCollection<IBillingDetails>(
        "Incomes",
        hospitalId?.toString()
      );
      const opdIncome = await opdIncomeColl.find({}).toArray();
      if (!opdIncome) {
        return res.status(404).json({
          success: false,
          message: "No bills found",
        });
      }
      opdIncome.forEach((opdIncome) => {
        if(opdIncome.appointmentId){
          opdBills++;
          opdTotalAmount += opdIncome.finalAmount;
        }
      })
      const result = {
        ipdBills,
        ipdTotalAmount,
        opdBills,
        opdTotalAmount,
        testBills,
        testTotalAmount
      }
      const financeColl = await getCollection<IFinance>("Finance", hospitalId?.toString());
      const finance = await financeColl.findOneAndUpdate(
        { hospitalId: hospitalId },
        {
          $set: {
            totalNumberOfBills: result,
          },
        },
        { returnDocument: "after"}
      );
      return res.status(200).json({
        success: true,
        message: "Number of different bills fetched successfully",
        data: finance,
      });
  }catch(error:any){
    console.error("Error getting number of different bills", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export const fetchWalletAmount = async (req: Request, res: Response) => {
  try{
    const { hospitalId } = req.query;
    const hospitalColl = await getCollection<IHospital>("Hospitals", null);
    const hospital = await hospitalColl.findOne({hospitalId: hospitalId as string});
    
    if(!hospital){
      return res.status(404).json({
        success: false,
        message: "Hospital not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Wallet amount fetched successfully",
      data: hospital!.wallet,
    })
    
  }catch(error:any){
    console.error("Internal Server Error", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}