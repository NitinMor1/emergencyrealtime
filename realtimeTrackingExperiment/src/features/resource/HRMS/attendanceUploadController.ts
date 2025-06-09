import { IAttendance, IEmployee, Approved } from "./hrModel";
import { Request, Response } from "express";
import { getCollection } from "../../../db/db";
import fs from "fs";
import csvParser from "csv-parser";
import exceljs from "exceljs";

/**
 * Reads a CSV file and returns its contents as an array of objects.
 * @param filePath - Path to the CSV file.
 * @returns Promise resolving to an array of objects representing the CSV data.
 */
export function readCsvFile(filePath: string): Promise<any[]> {
    if (!filePath) {
        throw new Error("File path is required");
    }

    return new Promise((resolve, reject) => {
        const results: any[] = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on("data", (data: any) => results.push(data))
            .on("end", () => resolve(results))
            .on("error", (error: any) => reject(new Error(error.message || error)));
    });
}

/**
 * Extracts attendance data from an Excel file.
 * @param filePath - Path to the Excel file.
 * @returns Promise resolving to an array of IAttendance objects.
 */
export async function extractAttendanceData(filePath: string): Promise<IAttendance[]> {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.worksheets[0]; // Get the first sheet
    const rawData: any[] = [];

    // Iterate through rows (skip the header row)
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
            const rowData: any = {};
            row.eachCell((cell, colNumber) => {
                const headerValue = sheet.getRow(1).getCell(colNumber).value;
                if (typeof headerValue === 'string') {
                    rowData[headerValue] = cell.value;
                }
            });
            rawData.push(rowData);
        }
    });

    // Map raw data to IAttendance objects
    return rawData.map((data: any) => ({
        empId: data["EmpId"]?.toString() || "", // Ensure empId is a string
        date: data["Date"]?.toString() || "", // Ensure date is a string
        checkInTime: data["In Time"]?.toString() || "", // Ensure checkInTime is a string
        checkInTimeInISO: new Date(data["In Time"]).toISOString() || "", // Convert to ISO string
        checkOutTime: data["Out Time"]?.toString() || "", // Ensure checkOutTime is a string
        checkOutTimeInISO: new Date(data["Out Time"]).toISOString() || "", // Convert to ISO string
        onLeave: Boolean(data["On Leave"]), // Convert to boolean
        leave_reason: data["Leave Reason"]?.toString() || "", // Ensure leave_reason is a string
        absent: Boolean(data["Absent"]), // Convert to boolean
        approved: data["Approved"] as Approved, // Ensure approved is of type Approved
        leaveType: data["Leave Type"]?.toString() || "", // Ensure leaveType is a string
    }));
}

/**
 * Handles the upload of attendance data from a file.
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const uploadAttendance = async (req: Request, res: Response) => {
    try {
        const file = req.file?.path;
        const { hospitalId } = req.query;

        if (!file) {
            return res.status(400).json({
                message: "File not found",
            });
        }

        if (!hospitalId) {
            return res.status(400).json({
                message: "Hospital ID is required",
            });
        }

        // Extract attendance data from the file
        const attendanceData = await extractAttendanceData(file);

        // Get the employee collection
        const attendanceCollection = await getCollection<IEmployee>("Employee", hospitalId.toString());

        // Update attendance for each employee
        for (const data of attendanceData) {
            const employee = await attendanceCollection.findOne({
                "ContactDetails.employeeId": data.empId,
            });

            if (!employee) {
                console.warn(`Employee with ID ${data.empId} not found`);
                continue; // Skip this employee and continue with the next one
            }

            // Update the employee's attendance record
            await attendanceCollection.updateOne(
                { "ContactDetails.employeeId": data.empId },
                {
                    $push: {
                        "HR.attendance": {
                            date: data.date,
                            checkInTime: data.checkInTime,
                            checkOutTime: data.checkOutTime,
                            checkInTimeInISO: data.checkInTimeInISO,
                            checkOutTimeInISO: data.checkOutTimeInISO,
                            onLeave: data.onLeave,
                            leave_reason: data.leave_reason,
                            absent: data.absent,
                            approved: data.approved,
                            leaveType: data.leaveType,
                        },
                    },
                }
            );
        }

        return res.status(200).json({
            message: "Attendance uploaded successfully",
        });
    } catch (error: any) {
        console.error("Error in uploadAttendance:", error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};