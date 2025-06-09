export interface IFormData {
    hospitalId: string;
    hospitalName: string;
    formId: string;
    formName: string;
    roleAccess: string; // Doctor or Nurse
    ipdId: string,
    formData: IData;
}

export interface IData {
    [key: string]: any;
}