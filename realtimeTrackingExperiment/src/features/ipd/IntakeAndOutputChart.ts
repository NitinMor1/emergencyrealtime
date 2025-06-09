export interface IntakeAndOutputChart {
    patientName: string;
    patientId: string;
    age: number;
    sex: string;
    hopitalId: string;
    ipdId: string;
    date_time: string;
    bedNo: string;
    roomNo: string;

    intakeChart: IntakeChartDetails[];
    outputChart: OutputChartDetails[];
    gastricsunction: number;
    missclellaneous: {
        type: string;
        quantity: number;
    }[];
    total:{
        intake: {
            IV_Fluids: number;
            Oral: number;
        };
        output: {
            urine: number;
            vomit: number;
            stool: {
                isPassed: boolean;
                numberOfTimes: number;
            };
            gasticSunction: number;
            missclellaneous: number
        };
        remarks: string | undefined;
    }
    siganture_of_staff_nurse: string;
}


export interface IntakeChartDetails {
    time: string;
    IV_Fluids: IV_Fluids;
    Oral: Oral;
    remarks: string | undefined;
}
export interface Oral {
    type: string;
    quantity: number;
}

export interface IV_Fluids {
    type: string;
    quantity: number;
}

export interface OutputChartDetails {
    time: string;
    urine: number;
    vomit: number;
    stool: number;
    remarks: string | undefined;
}