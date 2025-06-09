export interface IRadiology{
    patientId:string;
    radiologyId:string;
    radiologyName:string;
    radiologyType:string;
    radiologyDate_Time:string;
    radiologyStatus:string;
    radiologyReport:{
        imageUrl:string | "";
        scanUrl:string | "";
        reportUrl:string | "";
    };
    radiologyReportDate_Time:string;

    reffered_by:string;
    doctorId:string;
    radiologistId:string;
    equipmentId:string;
}