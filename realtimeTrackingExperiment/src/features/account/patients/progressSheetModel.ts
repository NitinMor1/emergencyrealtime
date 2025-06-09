export interface ProgressSheetModel {
    patientName: string;
    patientId: string;
    hospitalId: string;
    ipdId: string;
    DOL: string;
    DOA: string;
    Date: string;
    Chart_Completed_by: string;
    Treatement_chart_made_by: string;
    Today_Wt_GMS: string;
    Yest_Wt_GMS: string;
    Birth_Wt_GMS: string;
    Wt_Gain_Loss: string;
    Sex: string;
    Patient_on_Room_Air_Ventilator_Cpap: string;
    Ventilator_Pressure_Control: string;
    Pressure_Support: string;
    Rate: string;
    FIO2: string;
    Cpap_02_Flow_Rate: string;
    Feeds: string;
    NPO_On_ML_Feeds: string;
    Feed_Frequency_Hourly: number;
    Aspirate_ML: string;
    Colour_Of_Aspirate: string;
    Todays_AG: number;
    Yesterdays_AG_Gain_Loss: number;
    Stool_Passed_Times:number;
    Colour_Of_Stool_Urine_Total: string;
    Urine_Output_ML_KG_Day: number;
    Vomitings_times:number;
    Colour_Of_Vomit: string;
    Total_Urine_in_ml: number;
    Feeds_missed: string;
    IV_MLHR : iv;
    RBS_6_AM: string;
    BP_6_AM: string;
    Temp_6_AM: string;
    RBS_Frequency: string;
    BP_Frequency: string;
    TotalFeed: string;
    IVF: string;
    Syrups: string;
    Injections: string;
    Bolus: string;
    Aspirate: string;
    Total_Intake: string;
    Vomiting: string;
    Total_Output: string;
    Balance: string;
    isPositive: boolean;
    Planned_test_today_or_Next_Day: string;
    Old_Reports_Pending: string;
    FilledByMorningSraff: MorningStaff;
    Evening_Round: EveningRound[];
}
export enum iv{
    D5 = "D5%",
    D10 = "D10%",
    ISO_P = "ISO-P",
    Forte= "Forte",
    DNS = "DNS",
}

export interface MorningStaff{
    Name: string;
    All_injections_diluted_in_MI: string;
    Treatement_chart_Progress_Chart_Checked: string;
    Low_GC_to_be_taken_by_Morning_Duty_Staff_sign: string;
    Intracath_checked_by_Morning_Duty_Staff: string;
    Morning_Round_orders: string;
    Time: string;
}

export interface EveningRound{
    Staff_Incharge: string;
    Intracath_Checked: string;
    All_Injections_Diluted_in_MI: string;
    Emergency_Trolly_Checked: string;
    ohter: string[];
}
