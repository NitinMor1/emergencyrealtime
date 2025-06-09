import { Request, Response, NextFunction } from "express";
import { appointmentSchema } from "./Appointment.schema";

/**
 * Middleware to validate appointment data
 * Performs schema validation and business rule validation
 */
export const validateAppointment = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Validate against schema
        const result = appointmentSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: result.error.format(),
            });
        }

        // Business rule validation: appointment date cannot be in the past
        const appointmentDate = new Date(result.data.eventData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // ignore time when comparing

        if (appointmentDate < today) {
            return res.status(400).json({
                success: false,
                message: "Appointment date cannot be in the past",
            });
        }

        // All validations passed - replace body with parsed data
        req.body = result.data;
        next();
    } catch (error) {
        // Handle unexpected errors
        return res.status(500).json({
            success: false,
            message: "An error occurred during validation",
        });
    }
};