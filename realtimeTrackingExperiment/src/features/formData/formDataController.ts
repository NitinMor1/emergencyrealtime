import { Request, Response } from 'express';
import { getCollection } from '../../db/db';
import { IFormData } from './formDataModel';
import { IFormModel } from 'features/forms/formsModel';


export const addData = async (req: Request, res: Response) => {
    try {
        const { hospitalId, hospitalName, formId, ipdId, formName, roleAccess, formData } = req.body;
        if (!hospitalId || !hospitalName || !formId || !formName || !roleAccess || !formData) {
            return res.status(400).json({
                message: "Missing required fields",
                success: false
            });
        }
        const data: IFormData = {
            hospitalId: hospitalId.toString(),
            hospitalName: hospitalName.toString(),
            formId: formId.toString(),
            formName: formName.toString(),
            roleAccess: roleAccess.toString(),
            formData: formData,
            ipdId: ipdId.toString()
        }
        const dataColl = await getCollection<IFormData>(formName?.toString(), hospitalId?.toString());
        await dataColl.insertOne(data);
        return res.status(201).json({
            message: "Data added successfully",
            success: true
        });
    } catch (error: any) {
        console.error("Error in addData: ", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
}

export const getDataById = async (req: Request, res: Response) => {
    try {
        const { hospitalId, roleAccess, id } = req.body;
        const { formName } = req.body;

        if (!hospitalId || !formName || !id || !roleAccess) {
            return res.status(400).json({
                success: true,
                message: "all fields are required!"
            })
        }

        const formDataColl = await getCollection<IFormData>(formName.toString(), hospitalId.toString());
        const data = await formDataColl.findOne({ ipdId: id.toString(), roleAccess: roleAccess.toString() });
        if (!data) {
            return res.status(404).json({
                success: true,
                message: "requested data not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "data fetched successfully",
            data: data
        })
    } catch (error) {
        console.error("Error in getData by id: ", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
}

export const updateData = async (req: Request, res: Response) => {
    try {
        const { id, hospitalId, formName } = req.query;
        const { formData } = req.body;
        if (!id || !hospitalId || !formName || !formData) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }
        const dataColl = await getCollection<IFormData>(formName?.toString(), hospitalId?.toString());
        const data = await dataColl.findOne({ ipdId: id });
        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Data not found"
            });
        }
        
        // Deep merge function to recursively merge objects
        const deepMerge = (target: any, source: any) => {
            const output = { ...target };
            if (isObject(target) && isObject(source)) {
                Object.keys(source).forEach(key => {
                    if (isObject(source[key])) {
                        if (!(key in target)) {
                            Object.assign(output, { [key]: source[key] });
                        } else {
                            output[key] = deepMerge(target[key], source[key]);
                        }
                    } else {
                        Object.assign(output, { [key]: source[key] });
                    }
                });
            }
            return output;
        };
        
        // Helper function to check if value is an object
        const isObject = (item: any) => {
            return (item && typeof item === 'object' && !Array.isArray(item));
        };
        
        // Deep merge the existing formData with the new formData
        const mergedFormData = deepMerge(data.formData, formData);
        
        const updatedDate = await dataColl.findOneAndUpdate(
            { ipdId: id },
            { $set: { formData: mergedFormData } },
            { returnDocument: "after" }
        );
        
        res.status(200).json({
            success: true,
            message: "data updated successfully",
            data: updatedDate
        });
    } catch (error) {
        console.error("Error in updating data: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}


export const deleteData = async (req: Request, res: Response) => {
    try {
        const { id, hospitalId, formName } = req.query;
        if (!id || !hospitalId || !formName) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }
        const dataColl = await getCollection<IFormData>(formName?.toString(), hospitalId?.toString());
        const data = await dataColl.findOne({ ipdId: id });
        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Data not found"
            });
        }

        const deletedData = await dataColl.findOneAndDelete({ ipdId: id })
        res.status(200).json({
            success: true,
            message: "Data deleted successfully",
            data: deletedData
        })
    } catch (error) {
        console.error("Error in deleting record: ", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
}


export const fetchDataFromAllForms = async (req: Request, res: Response) => {
    try{
        const { hospitalId, ipdId } = req.query;
        const formColl = await getCollection<IFormModel>("defaultForms", hospitalId?.toString());
        const forms : IFormModel[] = await formColl.find().toArray();
        const formNames = forms.map((form) => form.formName); // name of forms are the new collection where we have to find data
        let ArrayOfData: (IFormData[] | { formName: string; data: never[] })[];
        ArrayOfData = await Promise.all(formNames.map(async (formName) => {
            console.log("formName: ", formName);
            const dataColl = await getCollection<IFormData>(formName as string, hospitalId?.toString());
            const data = await dataColl.find({ipdId: ipdId as string}).toArray();
            if (data.length === 0) {
                return [ ];
            }
            return data;
        }))
        res.status(200).json({
            success: true,
            message: "data fetched successfully",
            data: ArrayOfData
        })
    }catch(error:any){
        console.error("Error in fetchDataFromAllForms: ", error);
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
}