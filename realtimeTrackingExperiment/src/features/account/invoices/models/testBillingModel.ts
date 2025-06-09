import { TestType } from "../../../LabsScansTest/diagnostic/testModel";
import { IInsuranceDetails } from "./opdBillModel";

export interface Billing {
    hospitalId: string;
    transactionId: string;
    invoiceId: string;
    patientId: string;
    testOrderId: string;
    payerType: EPayerType;
    // lineItems: BillingLineItem[];
    paymentStatus: EPaymentStatus;
    accountingSystemId?: string;
    finalAmount: number;
    discount?: number;
    billingDate_time: string;
    insuranceDetails: IInsuranceDetails;
    // taxRecords: TaxComponent[]; // incomplete integrate with finance
    isPaid: boolean;
    }

export interface BillingLineItem {
    testType: TestType;
    cptCode: string;
    costCenter: string;
    unitPrice: number;
    quantity: number;
    discount: number;
    finalAmount: number;
}

export enum EPayerType {
    SELF_PAY = 'Self Pay',
    INSURANCE = 'Insurance',
    INSTITUTIONAL = 'Institutional'
    }

export enum EPaymentStatus {
    PENDING = 'pending',
    PARTIAL = 'partial',
    PAID = 'paid',
    DISPUTED = 'disputed'
    }

export interface TaxComponent {
        taxType: ETaxType;
        taxRate: number;
        taxableAmount: number;
        taxAmount: number;
        jurisdiction: string;
        taxId?: string;
    }

export enum ETaxType {
        VAT = 'vat',
        SALES_TAX = 'sales_tax',
        GST = 'gst',
        SERVICE_TAX = 'service_tax'
    }