import { Request, Response, Router } from "express";
import { verifyJWT } from "../../features/auth/ctrl_func";
import Razorpay from "razorpay";

const paymentRouter = Router();
export async function CreateOrder(req: Request, res: Response) {
    try {

        const { amount, currency, accountid, hospitalId } = req.body;
        const instance = new Razorpay({
            key_id: process.env.NODE_ENV === "Prod" ? process.env.PRODUCTION_RAZORPAY_KEY_ID as string : process.env.RAZORPAY_KEY_ID as string ?? "rzp_test_Rz6oyI4vHMWBeR",
            key_secret: process.env.NODE_ENV === "Prod"? process.env.PRODUCTION_RAZORPAY_KEY_SECRET as string : process.env.RAZORPAY_KEY_SECRET as string ?? "FlW0baP7EPx94DmcB9NNfdoE"
        });
        const amountdecuction = 9;
        const options = {
            amount: amount * 100,  // amount in smallest currency unit
            currency: currency,
            // transfers:[
            // {
            //     account:accountid,  // hospital account
            //     amount:(amount - amountdecuction)*100,
            //     currency:currency,
            //     notes:{
            //         hospitalId:hospitalId
            //     },

            //     linked_account_notes: [
            //         "Hospital Account"
            //       ],
            //       on_hold: 0

            // },
            // { 
            //     account:process.env.RAZORPAY_ACCOUNT_ID,  / medoc account
            //     amount:amountdecuction*100,
            //     currency:currency,
            //     notes:{
            //         hospitalId:hospitalId
            //     },
            //     linked_account_notes: [
            //         "Medoc Account"
            //       ],
            //       on_hold: 0

            // }
            // ],

        };
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.error("Error in creating order:", err);
                return res.status(500).json({
                    success: false,
                    message: "Error in creating order",
                    error: err
                });
            }
            return res.status(200).json({
                success: true,
                message: "Order created successfully",
                order: order
            });

        });
    } catch (error: any) {
        console.error("Error in CreateOrder:", error.message);
        return res.status(500).json({
            success: false,
            message: "Error in creating order",
        });

    }
}

paymentRouter.route("/createOrder").post(verifyJWT, CreateOrder);
export default paymentRouter;
