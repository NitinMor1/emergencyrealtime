import { ITEMTYPE, SUBTYPE, } from "../../../resource/Inventory/inventoryModel";

export interface Invoice {
    trnId: string;
    hospitalId: string;
    customerUsername?: string | undefined;
    customerName: string | undefined;
    type: TRNTYPE
    date_time: string | Date;
    totalAmount: number;
    packaging: number;
    freight: number;
    taxable_amount: number;
    tax_collected_at_source: number;
    round_off: number;
    grand_total: number;
    method_of_payment: string;
    contents: InvoiceLine[];
    placeHolder?: boolean;
    paymentStatus: IStatus;
    inventoryId: string; // {inventory Object Id (mongo Id)}
}

export enum IStatus {
    PENDING = "pending",
    PAID = "paid",
}

export interface InvoiceLine {
    itemType: ITEMTYPE;
    name: string;
    expiry: string | null;
    batchNo: string;
    hsnNo: string;
    sgst: number;
    cgst: number;
    packing: string;// like 30ml bottle or 60 ml bottle or for powders like 500g pack and 250g package
    subType: SUBTYPE;
    quantity: number;
    price: number;
    amount: number;
}

export enum TRNTYPE {
    INTERNAL = "internal",
    EXTERNAL = "external",
}

/* 
{
    "hospitalId": "hos_7BA7CF",
    "customerUsername": "CUST-0001",
    "customerName": "Customer",
    "type": "internal",
    "date": "2022-01-01",
    "totalAmount": 1000,
    "packaging": 100,
    "freight": 100,
    "taxable_amount": 1000,
    "tax_collected_at_source": 100,
    "round_off": 0,
    "grand_total": 1200,
    "method_of_payment": "cash",
    "contents": [
        {
            "itemType": "medicine",
            "name": "Paracetamol",
            "expiry": "2022-01-01",
            "batchNo": "BATCH-001",
            "hsnNo": "HSN-001",
            "sgst": 5,
            "cgst": 5,
            "packing": "30ml bottle",
            "subType": "tablet",
            "quantity": 10,
            "price": 100,
            "amount": 1000
        },
        {
            "itemType": "medicine",
            "name": "Paracetamol",
            "expiry": "2022-01-01",
            "batchNo": "BATCH-001",
            "hsnNo": "HSN-001",
            "sgst": 5,
            "cgst": 5,
            "packing": "30ml bottle",
            "subType": "tablet",
            "quantity": 10,
            "price": 100,
            "amount": 1000
        }
    ],
    "paymentStatus": "pending",
    "inventoryId": "INV-001"
}
*/