import { z } from "zod";

const medicationDetailSchema = z.object({
    dose: z.string(),
    route: z.string(),
    freq: z.string(),
    dur: z.string(),
    class: z.string(),
    when: z.string()
});

const medicationSchema = z.object({
    name: z.string(),
    medicationDetails: z.array(medicationDetailSchema)
});

const vitalsSchema = z.object({
    BP: z.string().optional(),
    Heartrate: z.string().optional(),
    RespiratoryRate: z.string().optional(),
    temp: z.string().optional(),
    spO2: z.string().optional(),
    weight: z.string().optional(),
    height: z.string().optional(),
    BMI: z.string().optional(),
    waist_hips: z.string().optional()
});

const systematicExaminationSchema = z.object({
    General: z.array(z.string()),
    CVS: z.array(z.string()),
    RS: z.array(z.string()),
    CNS: z.array(z.string()),
    PA: z.array(z.string()),
    ENT: z.array(z.string())
});

const testSchema = z.object({
    name: z.string(),
    instruction: z.string(),
    date: z.string()
});

const followUpSchema = z.object({
    date: z.string(),
    reason: z.string()
});

const nursingSchema = z.object({
    instruction: z.string(),
    priority: z.string()
});

const dischargeSchema = z.object({
    planned_date: z.string(),
    instruction: z.string(),
    Home_Care: z.string(),
    Recommendations: z.string()
});

const referralDoctorSchema = z.object({
    doctorName: z.string(),
    doctorUsername: z.string(),
    phoneNumber: z.string(),
    email: z.string(),
    hospitalId: z.string(),
    hospitalName: z.string(),
    speciality: z.string()
});

const icdCodeSchema = z.object({
    CODE: z.string(),
    DESCRIPTION: z.string()
});

const prescriptionSchema = z.object({
    name: z.string(),
    date: z.string().optional().default(() => new Date().toISOString()),
    time: z.string().optional().default(() => new Date().toLocaleTimeString()),
    doctorUsername: z.string(),
    patientUsername: z.string(),
    hospitalName: z.string(),
    hospitalId: z.string(),
    clinicalNote: z.string(),
    diagnosis: z.array(z.string()).optional().default([]),
    complaints: z.array(z.string()).optional().default([]),
    notes: z.array(z.string()).optional().default([]),
    medication: z.array(medicationSchema).optional().default([]),
    test: z.array(testSchema).optional().default([]),
    followup: followUpSchema.optional(),
    vitals: vitalsSchema.optional(),
    nursing: z.array(nursingSchema).optional().default([]),
    discharge: dischargeSchema.optional(),
    icdCode: z.array(icdCodeSchema).optional().default([]),
    MedicalHistory: z.array(z.string()).optional().default([]),
    SystematicExamination: systematicExaminationSchema.optional(),
    Assessment_Plan: z.string().optional(),
    Nutrition_Assessment: z.array(z.string()).optional().default([]),
    referredTo: referralDoctorSchema.optional(),
    toggle: z.union([z.boolean(), z.string()]).optional()
});

export const validatePrescription = (req: any, res: any, next: any) => {
    try {
        const validatedData = prescriptionSchema.parse(req.body);
        req.body = validatedData;
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error during validation"
        });
    }
};