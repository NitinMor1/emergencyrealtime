import { Router } from "express";
import {
  addExpense,
  addIncome,
  deleteExpense,
  deleteIncome,
  fetchWalletAmount,
  getAssets,
  getExpenses,
  getIncomes,
  getLiabilities,
  getNumberOfDifferentBills,
  getTotalFinance,
  updateExpense,
  updateIncome,
} from "./financeController";
import { verifyJWT } from "../auth/ctrl_func";
const financeRouter = Router();

financeRouter.route("/getTotalFinance").get(verifyJWT, getTotalFinance);
financeRouter.route("/getLiabilities").get(verifyJWT, getLiabilities);
financeRouter.route("/getAssets").get(verifyJWT, getAssets);
financeRouter.route("/getIncomes").get(verifyJWT, getIncomes);
financeRouter.route("/getExpenses").get(verifyJWT, getExpenses);
financeRouter.route("/addIncome").post(verifyJWT, addIncome);
financeRouter.route("/addExpense").post(verifyJWT, addExpense);
financeRouter.route("/updateIncome").post(verifyJWT, updateIncome);
financeRouter.route("/updateExpense").post(verifyJWT, updateExpense);
financeRouter.route("/deleteIncome").post(verifyJWT, deleteIncome);
financeRouter.route("/deleteExpense").post(verifyJWT, deleteExpense);
financeRouter.route("/getTotalBills").get(verifyJWT, getNumberOfDifferentBills);
financeRouter.route("/getWalletAmount").get(verifyJWT, fetchWalletAmount);
export default financeRouter;
