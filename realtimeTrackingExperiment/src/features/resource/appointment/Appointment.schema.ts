import { z } from "zod";

/**
 * Schema definitions for appointment data validation
 */

// Reusable ISO date string validator with proper error handling
const isoDateString = z.string().refine((val) => {
    try {
        const date = new Date(val);
        return !isNaN(date.getTime()) && val === date.toISOString().split("T")[0];
    } catch (error) {
        return false;
    }
}, {
    message: "Date must be in ISO 8601 format (YYYY-MM-DD) and valid",
});

/**
 * Appointment event data schema
 */
export const appointmentEventDataSchema = z.object({
    date: isoDateString,
    timeSlot: z.string().trim().min(1, "Time slot is required"),
    problem: z.string().trim().min(1, "Problem description is required"),
    appointment_number: z.number().optional(),
    priority: z.number().min(1, "Priority must be greater than 0"),
    medocCardUrl: z.string().optional().nullable(),
});

/**
 * Complete appointment schema
 */
export const appointmentSchema = z.object({
    hospitalId: z.string().trim().min(1, "Hospital ID is required"),
    title: z.string().trim().min(1, "Title is required"),
    doctorUsername: z.string().trim().min(1, "Doctor username is required"),
    patientUsername: z.string().trim().min(1, "Patient username is required"),
    doctorName: z.string().trim().min(1, "Doctor name is required"),
    patientName: z.string().trim().min(1, "Patient name is required"),
    location: z.string().trim().min(1, "Location is required"),
    eventData: appointmentEventDataSchema,
});

// Type definitions for TypeScript
export type AppointmentEventData = z.infer<typeof appointmentEventDataSchema>;
export type Appointment = z.infer<typeof appointmentSchema>;