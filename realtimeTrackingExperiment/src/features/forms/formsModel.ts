export interface IFormModel {
    formName: string;
    formType: string;
    formId: string;
    hospitalId: string;
    formDescription: string;
    sections: {
        title: string;
        fields: {
        label: string;
        type: string;
        key: string;
        required: boolean;
        options?: string[];
        tableData?: string[][];
        }[];
    }[];
};