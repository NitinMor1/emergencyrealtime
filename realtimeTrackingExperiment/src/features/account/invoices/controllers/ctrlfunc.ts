import { Collection } from "mongodb";
import { Invoice } from "../models/invoicesModel";
import { IBillingDetails } from "../models/opdBillModel";
import { IIpdBillingDetail } from "../models/ipdBillModel";
import { Billing } from "../models/testBillingModel";
export async function generateInvoiceId(invoiceColl: Collection<Invoice>) {
    const now = new Date();
    if (isNaN(now.getTime())) {
        throw new Error("Invalid current date");
    }

    const date0 = now.toISOString().replace(/[^0-9]/g, "");
    let date1 = parseFloat(date0);

    const response = await invoiceColl.aggregate([
        { $project: { date_time: 1, transaction_id: 1 } },
        { $sort: { date_time: -1 } },
        { $limit: 50 }
    ]).toArray();

    for (const i of response) {
        const date2 = new Date(i.date_time);
        if (isNaN(date2.getTime())) {
            console.warn(`Invalid date found in database: ${i.date_time}`);
            continue;
        }

        const date2String = date2.toISOString().replace(/[^0-9]/g, "");
        if (date2String.startsWith(date0)) {
            const existingId = parseFloat(i.transaction_id.substr(4));
            if (date1 <= existingId) {
                date1 = existingId + 1;
            }
        }
    }

    return `txn_${date1}`;
}

export async function genOpdBillId(opdBillColl: Collection<IBillingDetails>) {
    const now = new Date();
    if (isNaN(now.getTime())) {
        throw new Error("Invalid current date");
    }

    const date0 = now.toISOString().replace(/[^0-9]/g, "");
    let date1 = parseFloat(date0);

    const response = await opdBillColl.aggregate([
        { $project: { billingDate_time: 1, transaction_id: 1 } },
        { $sort: { billingDate_time: -1 } },
        { $limit: 50 }
    ]).toArray();

    for (const i of response) {
        const date2 = new Date(i.date_time);
        if (isNaN(date2.getTime())) {
            console.warn(`Invalid date found in database: ${i.date_time}`);
            continue;
        }

        const date2String = date2.toISOString().replace(/[^0-9]/g, "");
        if (date2String.startsWith(date0)) {
            const existingId = parseFloat(i.transaction_id.substr(4));
            if (date1 <= existingId) {
                date1 = existingId + 1;
            }
        }
    }

    return `bill_${date1}`;
}

export async function genIpdBillId(opdBillColl: Collection<IIpdBillingDetail>) {
    const now = new Date();
    if (isNaN(now.getTime())) {
        throw new Error("Invalid current date");
    }

    // Format current date as a numeric string (e.g., "20250521123456789")
    const datePrefix = now.toISOString().replace(/[^0-9]/g, "");
    
    // Get the date part only (YYYYMMDD)
    const datePart = datePrefix.substring(0, 8);
    
    // Find the highest bill number for today
    const response = await opdBillColl.aggregate([
        { 
            $match: { 
                transaction_id: { $regex: `^bill_${datePart}` } 
            } 
        },
        { $sort: { transaction_id: -1 } },
        { $limit: 1 }
    ]).toArray();

    let sequenceNumber = 1;
    
    // If we found an existing bill for today, extract its sequence number and increment
    if (response.length > 0 && response[0].transaction_id) {
        const lastBillId = response[0].transaction_id;
        // Extract sequence number from the end of the transaction_id
        const matches = lastBillId.match(/bill_\d+(\d{4})$/);
        if (matches && matches[1]) {
            sequenceNumber = parseInt(matches[1], 10) + 1;
        }
    }
    
    // Ensure sequence number is 4 digits with leading zeros
    const paddedSequence = sequenceNumber.toString().padStart(4, '0');
    
    // Create new bill ID: "bill_" + YYYYMMDD + sequence (4 digits)
    return `bill_${datePart}${paddedSequence}`;
}


export async function genTestBillId(opdBillColl: Collection<Billing>) {
    const now = new Date();
    if (isNaN(now.getTime())) {
        throw new Error("Invalid current date");
    }

    // Format current date as a numeric string (e.g., "20250521123456789")
    const datePrefix = now.toISOString().replace(/[^0-9]/g, "");
    
    // Get the date part only (YYYYMMDD)
    const datePart = datePrefix.substring(0, 8);
    
    // Find the highest bill number for today
    const response = await opdBillColl.aggregate([
        { 
            $match: { 
                transaction_id: { $regex: `^bill_${datePart}` } 
            } 
        },
        { $sort: { transaction_id: -1 } },
        { $limit: 1 }
    ]).toArray();

    let sequenceNumber = 1;
    
    // If we found an existing bill for today, extract its sequence number and increment
    if (response.length > 0 && response[0].transaction_id) {
        const lastBillId = response[0].transaction_id;
        // Extract sequence number from the end of the transaction_id
        const matches = lastBillId.match(/bill_\d+(\d{4})$/);
        if (matches && matches[1]) {
            sequenceNumber = parseInt(matches[1], 10) + 1;
        }
    }
    
    // Ensure sequence number is 4 digits with leading zeros
    const paddedSequence = sequenceNumber.toString().padStart(4, '0');
    
    // Create new bill ID: "bill_" + YYYYMMDD + sequence (4 digits)
    return `bill_${datePart}${paddedSequence}`;
}
