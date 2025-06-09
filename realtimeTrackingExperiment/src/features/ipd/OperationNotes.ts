export interface operationNotes{
    patientName: string;
    patientId: string;
    hospitalId: string;
    ipdId: string;
    date_time: string;
    bedNo: string;
    roomNo: string;
    Age: string
    operationNotes: OperationNotesDetails[];
    preOperativeDiagnosis: string;
    postOperativeDiagnosis: string;
    TypeOfAnaesthesia: string;
    OperativeFindings: string;
    Steps_Procedure: string;
    Post_op_instruction_Order: string;
}

export interface OperationNotesDetails{
    Date: string;
    Time: string;
    Surgeons: surgeon[];
    Anaesthetists: anaesthetist[];
    OT_Staff: OTStaffs[];
    Anaesthesia: anaesthetist[];
    procedure: string;
    position: string;
}

export interface surgeon{
    name: string;
    empId: string;
    qualification: string;
    designation: string;
    timeIn: string;
    timeOut: string;
    operation: string;
    assistant: string;
}
export interface anaesthetist{
    name: string;
    empId: string;
    qualification: string;
    designation: string;
    timeIn: string;
    timeOut: string;
    operation: string;
    assistant: string;
}

export interface OTStaffs{
    name: string;
    empId: string;
    qualification: string;
    designation: string;
    timeIn: string;
    timeOut: string;
}