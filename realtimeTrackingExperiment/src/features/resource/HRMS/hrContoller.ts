import { Request, Response } from "express";
import {
  IEmployee,
  IPayroll,
  payrollStatus,
  IAttendance,
  IShift,
  IGazettedLeaves,
  IHR,
  Approved,
  ILeaveType,
  ILT,
  INotification,
  IDutyRoster,
  IADMIN,
  IOverTime
} from "./hrModel";
import { ObjectId, Document } from "mongodb";
import { getCollection } from "../../../db/db";
import { IDoctor, IModes } from "../../account/doctors/DoctorModel";
import { getEmployeeId, getUsername } from "../../account/users/user_ctrlfunc";
import { EDepartment, IHospital } from "../../auth/HospitalModel";
import { isValidObjectId } from "mongoose";

// Cache for storing frequently accessed data to reduce DB calls
const departmentCache = new Map<string, string[]>();
const clearDepartmentCache = (hospitalId: string) => departmentCache.delete(hospitalId);

/* 
  1. CRUD
  2. Attendance should be through H+ 
  3. Gate Pass request / Leave Request 
  4. Show Duty Roster 
  5. Online Leaves -> GH created by Admin
  6. Edit check in and check out time must be approved by the supervisor/admin
*/

export const getEmployeeById = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const employeeColl = await getCollection<IEmployee>(
      "Employee",
      hospitalId?.toString()
    );
    const employee = await employeeColl.findOne({ _id: mongoId });
    if (!employee) {
      return res.status(404).json({
        success: true,
        message: "Employee not found.",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Employee fetched successfully.",
        data: employee,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Error in fetching the employee",
    });
  }
};

export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.query;
    const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
    const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
    const limit = upperLimit - lowerLimit; // Calculate the limit for the query

    if (limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid range: upperLimit must be greater than lowerLimit"
      });
    }
    const employeeColl = await getCollection<IEmployee>(
      "Employee",
      hospitalId?.toString()
    );
    const employees: IEmployee[] = await employeeColl.find({}).skip(lowerLimit).limit(limit).toArray();
    if (!employees) {
      return res.status(404).json({
        success: true,
        message: "No employees found.",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Employees fetched successfully.",
        data: employees,
        department: await employeeColl.distinct("department"),
      });
    }
  } catch (err: any) {
    console.error("Error in fetching the employees:", err);
    return res.status(500).json({
      success: false,
      message: "Error in fetching the employees",
    });
  }
};

function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export const addEmployee = async (req: Request, res: Response) => {
  try {
    const {
      hospitalId,
      employeeId,
      name,
      dateOfBirth,
      gender,
      phoneNumber,
      email,
      address,
      joining_date,
      total_payable_salary,
      total_paid_salary,
      leaving_date,
      salary,
      role,
      department,
      supervisor,
      attendance,
      shift,
      actual_working_hours,
      dutyRoster,
      subordinates,
    } = req.body;

    // Validate required fields
    if (!role || !name || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "name and role and phoneNumber is required",
      });
    }

    if (phoneNumber.length < 10) {
      return res.status(400).json({
        success: false,
        message: "phoneNumber must be 10 digits",
      });
    }
    let newPhoneNumber;
    if (phoneNumber.length > 10 && phoneNumber.length < 13) {
      // remove +91 from the phone number
      if (phoneNumber.startsWith("+91")) {
        newPhoneNumber = phoneNumber.substring(3);
        if (newPhoneNumber.length !== 10) {
          return res.status(400).json({
            success: false,
            message: "phoneNumber must be 10 digits",
          });
        } else if (phoneNumber.startsWith("0") && phoneNumber.length === 11) {
          newPhoneNumber = newPhoneNumber.substring(1);
        }
      }
    }

    // Check if doctor role without email
    const isDoctor = role.role === "doctor" || role.role === IADMIN.DOCTOR as IADMIN;
    if (isDoctor && !email) {
      return res.status(400).json({
        success: false,
        message: "Email is required for doctor",
      });
    }

    // Create employee data object
    const employeeData: IEmployee = {
      hospitalId: hospitalId?.toString(),
      ContactDetails: {
        employeeId: employeeId ?? getEmployeeId(name, newPhoneNumber) ?? "",
        name,
        dateOfBirth,
        gender,
        phoneNumber: newPhoneNumber,
        address,
        email,
        username: getUsername(name, newPhoneNumber)
      },
      HR: {
        joining_date: joining_date || "",
        total_payable_salary: total_payable_salary || "",
        total_paid_salary: total_paid_salary || "",
        leaving_date: leaving_date || "",
        salary: salary || 0,
        role,
        department: department || "",
        supervisor: supervisor || [],
        subordinates: subordinates || [],
        no_of_leave: 0,
        no_of_absent: 0,
        attendance: attendance || [],
        performance_remarks: [],
        history_payroll: [],
        shift: shift || IShift.MORNING,
        actual_working_hours: actual_working_hours || 0,
        extra_working_hours: 0,
        dutyRoster: dutyRoster ?? [],
        allLeaves: [],
        roleAccess: [],
      },
    };

    // Insert employee to database
    const employeeColl = await getCollection<IEmployee>(
      "Employee",
      hospitalId?.toString()
    );
    if (employeeData.HR.supervisor && employeeData.HR.supervisor?.length > 0 && !isDoctor) {
      const supervisorList = employeeData.HR.supervisor;
      for (const supervisorUsername of supervisorList) {
        const supervisorEmployee = await employeeColl.findOne({
          "ContactDetails.username": supervisorUsername,
        })
        if (supervisorEmployee && supervisorEmployee.HR.role.role !== IADMIN.DOCTOR as IADMIN) {
          await employeeColl.findOneAndUpdate({
            "ContactDetails.username": supervisorUsername,
          }, {
            $addToSet: {
              subordinates: employeeData.ContactDetails.username
            }
          })
        }
      }
    }
    const employee = await employeeColl.insertOne(employeeData);
    let message;
    let msg;
    // Handle doctor-specific logic
    if (isDoctor) {
      const doctorColl = await getCollection<IDoctor>("DoctorList", null);
      const username = getUsername(name, newPhoneNumber);

      // Check if doctor already exists
      const existingUser = await doctorColl.findOne({ phoneNumber: employeeData.ContactDetails.phoneNumber });

      if (existingUser && !(existingUser.listOfHospitals.includes(hospitalId?.toString()))) {
        // Update existing doctor's hospital list
        await doctorColl.findOneAndUpdate(
          { phoneNumber: employeeData.ContactDetails.phoneNumber },
          { $addToSet: { listOfHospitals: hospitalId?.toString() } }
        );
      } else if (!existingUser && isDoctor) {
        // Create new doctor
        const doctorData: IDoctor = {
          hospitalId: "",
          doctorName: name,
          doctorUsername: username,
          email,
          password: generateOtp(),
          phoneNumber,
          mode: IModes.FULLTIME,
          specialization: "",
          address,
          listOfHospitals: [hospitalId?.toString()],
          department: EDepartment.OTHER,
        };

        // Insert doctor first to establish record for supervisor relationships
        await doctorColl.insertOne(doctorData);

        // Handle supervisor relationships if any
        const supervisorList = employeeData.HR.supervisor;

        if (supervisorList && supervisorList.length > 0) {
          for (const supervisorUsername of supervisorList) {
            // Check if supervisor is a doctor
            const supervisorEmployee = await employeeColl.findOne({
              "ContactDetails.username": supervisorUsername,
            });

            const isSupervisorDoctor = supervisorEmployee?.HR.role.role === "doctor" ||
              supervisorEmployee?.HR.role.role === IADMIN.DOCTOR as IADMIN;

            if (isSupervisorDoctor) {
              const supervisorDoctor = await doctorColl.findOne({ doctorUsername: supervisorUsername });
              if (!supervisorDoctor) {
                message = "Supervisor doctor not found in doctor database";
                continue
              };

              // Find the newly created/updated doctor record
              const subordinateDoctor = await doctorColl.findOne({ phoneNumber: employeeData.ContactDetails.phoneNumber });
              if (!subordinateDoctor) {
                msg = "Subordinate doctor not found in doctor database";
                continue;
              }

              // Update supervisor with new subordinate
              await doctorColl.findOneAndUpdate(
                { doctorUsername: supervisorDoctor.doctorUsername },
                { $addToSet: { subOrdinates: subordinateDoctor.doctorUsername } }
              );

              // Update subordinate with supervisor
              await doctorColl.findOneAndUpdate(
                { phoneNumber },
                { $addToSet: { supervisors: supervisorDoctor.doctorUsername } }
              );

              await employeeColl.findOneAndUpdate({
                "ContactDetails.username": supervisorUsername
              }, {
                $addToSet: {
                  subordinates: employeeData.ContactDetails.username
                }
              })
            }
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Employee added successfully.",
      data: employee,
      importantMessage: {
        message1: message,
        message2: msg
      }
    });
  } catch (error: any) {
    console.error("Error in adding the employee:", error);
    return res.status(500).json({
      success: false,
      message: "Error in adding the employee",
    });
  }
};

export const updatedEmployee = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);

    const { ContactDetails, HR } = req.body;


    if (
      HR &&
      ContactDetails &&
      (HR?.role?.role === "doctor" || HR?.role?.role === IADMIN.DOCTOR) &&
      Object.keys(ContactDetails).includes("name") &&
      Object.keys(ContactDetails).includes("phoneNumber")
    ) {
      return res.status(400).json({
        success: false,
        message: "For doctors, updating 'name' or 'phoneNumber' is not allowed after creation."
      });
    }

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Please provide the hospitalId",
      });
    }

    const employeeColl = await getCollection<IEmployee>(
      "Employee",
      hospitalId.toString()
    );

    const employee = await employeeColl.findOne({ _id: mongoId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }
    const doctorColl = await getCollection<IDoctor>("DoctorList", null);


    // Only update fields that are provided in the request body
    const contactDetails = ContactDetails
      ? {
        employeeId:
          ContactDetails.employeeId ?? employee.ContactDetails.employeeId,
        name: ContactDetails.name ?? employee.ContactDetails.name,
        dateOfBirth:
          ContactDetails.dateOfBirth ?? employee.ContactDetails.dateOfBirth,
        email: ContactDetails.email ?? employee.ContactDetails.email,
        phoneNumber:
          ContactDetails.phoneNumber ?? employee.ContactDetails.phoneNumber,
        address: ContactDetails.address ?? employee.ContactDetails.address,
        gender: ContactDetails.gender ?? employee.ContactDetails.gender,
        username: ContactDetails.username ?? getUsername(ContactDetails.name, ContactDetails.phoneNumber),
      }
      : employee.ContactDetails;

    // Only update HR fields that are provided in the request body
    const updatedHR = HR
      ? {
        joining_date: HR.joining_date ?? employee.HR.joining_date,
        total_payable_salary:
          HR.total_payable_salary ?? employee.HR.total_payable_salary,
        total_paid_salary:
          HR.total_paid_salary ?? employee.HR.total_paid_salary,
        leaving_date: HR.leaving_date ?? employee.HR.leaving_date,
        salary: HR.salary ?? employee.HR.salary,
        role: HR.role ?? employee.HR.role,
        department: HR.department ?? employee.HR.department,
        supervisor: HR.supervisor ?? employee.HR.supervisor,
        no_of_leave: HR.no_of_leave ?? employee.HR.no_of_leave,
        no_of_absent: HR.no_of_absent ?? employee.HR.no_of_absent,
        attendance: HR.attendance ?? employee.HR.attendance,
        performance_remarks:
          HR.performance_remarks ?? employee.HR.performance_remarks,
        history_payroll: HR.history_payroll ?? employee.HR.history_payroll,
        shift: HR.shift ?? employee.HR.shift,
        actual_working_hours:
          HR.actual_working_hours ?? employee.HR.actual_working_hours,
        extra_working_hours:
          HR.extra_working_hours ?? employee.HR.extra_working_hours,
        dutyRoster: HR.dutyRoster ?? employee.HR.dutyRoster,
      }
      : employee.HR;

    if (updatedHR.role.role === "doctor" || updatedHR.role.role === IADMIN.DOCTOR as IADMIN) {
      const existingDoctor = await doctorColl.findOne(
        {
          doctorUsername: contactDetails.username.toString()
        }
      )

      if (!existingDoctor) {
        return res.status(404).json(
          {
            success: false,
            message: "doctor doesn't exist in doctorList"
          }
        )
      }
      const doctor: Partial<IDoctor> = {
        doctorName: contactDetails.name,
        email: contactDetails.email,
        phoneNumber: contactDetails.phoneNumber,
        specialization: HR.department,
        address: contactDetails.address
      }

      await doctorColl.findOneAndUpdate(
        { _id: new ObjectId(existingDoctor._id.toString()) },
        {
          $set: doctor
        }
      )
    }
    let total_payable_salary = employee.HR.total_payable_salary;
    let total_paid_salary = employee.HR.total_paid_salary;

    if (employee.HR.history_payroll && employee.HR.history_payroll.length > 0) {
      for (const payroll of employee.HR.history_payroll) {
        const payrollAmount =
          employee.HR.salary + payroll.allowances - payroll.deductions;
        if (payroll.status === payrollStatus.PENDING) {
          total_payable_salary += payrollAmount;
        } else if (payroll.status === payrollStatus.PAID) {
          total_paid_salary += payrollAmount;
        }
      }
    }

    // Only update fields that have changed
    const updateObject: any = {};
    if (ContactDetails) updateObject.ContactDetails = contactDetails;
    if (HR) updateObject.HR = updatedHR;
    let message;
    let msg;

    if (updateObject.HR.supervisor.length > 0) {
      const supervisors = updatedHR.supervisor
      const doctorColl = await getCollection<IDoctor>("DoctorList", null);
      for (let supervisorUsername of supervisors) {
        // Check if supervisor is a doctor
        const supervisorEmployee = await employeeColl.findOne({
          "ContactDetails.username": supervisorUsername,
        });
        await employeeColl.findOneAndUpdate({
          "ContactDetails.username": supervisorUsername,
        }, {
          $addToSet: {
            subordinates: contactDetails.username
          }
        })
        const isSupervisorDoctor = supervisorEmployee?.HR.role.role === "doctor" ||
          supervisorEmployee?.HR.role.role === IADMIN.DOCTOR as IADMIN;

        if (isSupervisorDoctor) {
          const supervisorDoctor = await doctorColl.findOne({ doctorUsername: supervisorUsername });
          if (!supervisorDoctor) {
            message = "Supervisor doctor not found in doctor database with username: " + supervisorUsername;
            continue;
          };

          // Find the newly created/updated doctor record
          const subordinateDoctor = await doctorColl.findOne({ phoneNumber: contactDetails.phoneNumber });
          if (!subordinateDoctor) {
            msg = "Subordinate doctor not found in doctor database with phone number and username: " + contactDetails.phoneNumber + " " + contactDetails.username;
            continue;
          }

          // Update supervisor with new subordinate
          await doctorColl.findOneAndUpdate(
            { doctorUsername: supervisorDoctor.doctorUsername },
            { $addToSet: { subOrdinates: subordinateDoctor.doctorUsername } }
          );

          // Update subordinate with supervisor
          await doctorColl.findOneAndUpdate(
            { phoneNumber: contactDetails.phoneNumber },
            { $addToSet: { supervisors: supervisorDoctor.doctorUsername } }
          );
        }
      }
    }

    const result = await employeeColl.findOneAndUpdate(
      { _id: mongoId },
      { $set: updateObject },
      { returnDocument: "after" }
    );

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: result,
      importantMessage: {
        message1: message,
        message2: msg
      }
    });
  } catch (e) {
    console.error("Error in updating the employee:", e);
    return res.status(500).json({
      success: false,
      message: "Error in updating the employee",
    });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const employeeColl = await getCollection<IEmployee>(
      "Employee",
      hospitalId?.toString()
    );
    const employee = await employeeColl.findOneAndDelete({ _id: mongoId });

    if (!employee) {
      console.log("Employee not found");
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully.",
      data: employee,
    });
  } catch (error) {
    console.error("Error in deleting the employee:", error);
    return res.status(500).json({
      success: false,
      message: "Error in deleting the employee.",
    });
  }
};

const updateEmployeeWorkingHours = (
  checkInTime: string, // ISO date string (actual check-in time)
  checkOutTime: string, // ISO date string (actual check-out time)
  start: string, // ISO date string (expected work start time)
  end: string // ISO date string (expected work end time)
): number => {
  const checkIn = new Date(checkInTime);
  const checkOut = new Date(checkOutTime);
  const workStart = new Date(start);
  const workEnd = new Date(end);

  // Validate that all dates are valid
  if (
    isNaN(checkIn.getTime()) ||
    isNaN(checkOut.getTime()) ||
    isNaN(workStart.getTime()) ||
    isNaN(workEnd.getTime())
  ) {
    throw new Error("Invalid date format");
  }

  // Ensure check-in is before check-out
  if (checkOut < checkIn) {
    throw new Error("Check-out time cannot be before check-in time");
  }

  // Calculate actual working hours (expected work start to end time)
  const actualWorkingHours =
    (workEnd.getTime() - workStart.getTime()) / 3600000;

  // Calculate current working hours (actual check-in to check-out time)
  const currentWorkingHours =
    (checkOut.getTime() - checkIn.getTime()) / 3600000;

  // Calculate the extra working hours
  const extraWorkingHours = currentWorkingHours - actualWorkingHours;

  return extraWorkingHours; // Return the extra working hours as a number
};


export const updateAttendance = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    let { isCheckIn, isCheckOut } = req.body;

    if (!hospitalId || !id) {
      return res.status(400).json({
        success: false,
        message: "Please provide the hospitalId and id",
      });
    }

    if (!isValidObjectId(id as string)) res.status(400).json({ success: true, message: "id must be a valid mongo id" })

    const mongoId = new ObjectId(id as string);
    const employeeColl = await getCollection<IEmployee>(
      "Employee",
      hospitalId.toString()
    );
    const employee = await employeeColl.findOne({ _id: mongoId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    let updatedAttendance = [...employee.HR.attendance];
    let extraWorkingHours = employee.HR.extra_working_hours;

    if (isCheckIn) {
      const lastAttendance = updatedAttendance[updatedAttendance.length - 1];
      if (lastAttendance && !lastAttendance.checkOutTime) {
        return res.status(400).json({
          success: false,
          message: "Please check out first",
        });
      }

      const newAttendance: IAttendance = {
        empId: mongoId.toString(),
        date: new Date().toISOString().split("T")[0], // Storing date in ISO format
        checkInTime: new Date().toString().split(" ")[4],
        checkInTimeInISO: new Date().toISOString(),
        checkOutTime: "",
        checkOutTimeInISO: "",
        onLeave: false,
        leave_reason: "",
        absent: false,
        approved: Approved.NOLEAVE,
        leaveType: ILT.CasualLeave,
      };
      updatedAttendance.push(newAttendance);
    } else if (isCheckOut) {
      const lastAttendance = updatedAttendance[updatedAttendance.length - 1];
      if (!lastAttendance || lastAttendance.checkOutTime) {
        return res.status(400).json({
          success: false,
          message: "Please check in first",
        });
      }
      lastAttendance.checkOutTime = new Date().toString().split(" ")[4];
      lastAttendance.checkOutTimeInISO = new Date().toISOString();

      let start, end;
      for (let currentDutyRoster of employee.HR.dutyRoster) {
        if (currentDutyRoster.date === lastAttendance.date) {
          start = currentDutyRoster.start;
          end = currentDutyRoster.end;
          break;
        }
      }

      if (!start || !end) {
        return res.status(404).json({
          success: false,
          message: "Duty roster information not found for the current date",
        });
      }

      const currentExtraWorkingHours = parseFloat(
        updateEmployeeWorkingHours(
          lastAttendance.checkInTimeInISO,
          lastAttendance.checkOutTimeInISO,
          start,
          end
        ).toString()
      );

      extraWorkingHours += currentExtraWorkingHours;
    }

    const updatedHR: Partial<IHR> = {
      attendance: updatedAttendance,
      extra_working_hours: extraWorkingHours,
    };

    const result = await employeeColl.findOneAndUpdate(
      { _id: mongoId },
      { $set: { HR: { ...employee.HR, ...updatedHR } } },
      { returnDocument: "after" }
    );

    return res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error in updating the attendance", error);
    return res.status(500).json({
      success: false,
      message: "Error in updating the attendance",
      error: error.message,
    });
  }
};

// use npm crone to reset attendance of the employee at the start of the month with the help of this function automatically on date 1 of every month
// export const resetAttendance = async (req: Request, res: Response) => {
//   try {
//     const { hospitalId, id } = req.query;
//     const mongoId = new ObjectId(id as string);
//     const employeeColl = await getCollection<IEmployee>(
//       "Employee",
//       hospitalId?.toString()
//     );
//     const employee = await employeeColl.findOne({ _id: mongoId });

//     if (!employee) {
//       return res.status(404).json({
//         success: false,
//         message: "Employee not found.",
//       });
//     }

//     const result = await employeeColl.findOneAndUpdate(
//       { _id: mongoId },
//       { $set: { "HR.attendance": [] } },
//       { returnDocument: "after" }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "Attendance reset successfully",
//       data: result,
//     });
//   } catch (error: any) {
//     console.error("Error in resetting the attendance", error);
//     return res.status(500).json({
//       success: false,
//       message: "Error in resetting the attendance",
//       error: error.message,
//     });
//   }
// };

// need to clear the leave logic a bit more

export const markLeave = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const { startDate, endDate, onLeave, leave_reason, leaveType } = req.body;
    const leaveColl = await getCollection<IAttendance>(
      "Leaves",
      hospitalId?.toString()
    );
    const employeeColl = await getCollection<IEmployee>(
      "Employee",
      hospitalId?.toString()
    );
    const employee = await employeeColl.findOne({ _id: mongoId });
    if (!employee) {
      return res.status(404).json({
        success: true,
        message: "Employee not found.",
      });
    }
    const numberOfLeaves = employee.HR.no_of_leave!;
    if (numberOfLeaves >= 15) {
      return res.status(400).json({
        success: false,
        message: "You have already used all your leaves",
      });
    }
    const attendance = employee.HR.attendance;
    if (!endDate || endDate === "") {
      const data: IAttendance = {
        empId: mongoId?.toString(),
        date: startDate,
        checkInTime: "",
        checkOutTime: "",
        checkInTimeInISO: "",
        checkOutTimeInISO: "",
        onLeave: false,
        leave_reason: leave_reason || "",
        absent: false,
        approved: Approved.PENDING,
        leaveType: leaveType || ILT.CasualLeave,
      };
      const insertLeave = await leaveColl.insertOne(data);
      return res.status(200).json({
        success: true,
        message: "Leave marked successfully",
      });
    } else {
      const dates = getDatesInRange(startDate, endDate);
      const updatedAttendance = await Promise.all(
        dates.map(async (date) => {
          const data: IAttendance = {
            empId: mongoId?.toString(),
            date: date,
            checkInTime: "",
            checkOutTime: "",
            checkInTimeInISO: "",
            checkOutTimeInISO: "",
            onLeave: onLeave || false,
            leave_reason: leave_reason || "",
            absent: false,
            approved: Approved.PENDING,
            leaveType: leaveType || ILT.CasualLeave,
          };
          await leaveColl.insertOne(data);
          return data;
        })
      );

      return res.status(200).json({
        success: true,
        message: "Leave marked successfully",
        data: updatedAttendance,
      });
    }
  } catch (error: any) {
    console.error("Error in marking the leave", error);
    return res.status(500).json({
      success: false,
      message: "Error in marking the leave",
      error: error.message,
    });
  }
};

// need to clear the approve logic a bit more
export const approveLeave = async (req: Request, res: Response) => {
  try {
    let { hospitalId, leaveid, approved } = req.query;
    const mongoId = new ObjectId(leaveid as string);
    const leaveColl = await getCollection<IAttendance>(
      "Leaves",
      hospitalId?.toString()
    );
    const employee = await leaveColl.findOne({ _id: mongoId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee leave not found",
      });
    }
    const data: IAttendance = {
      empId: employee.empId,
      date: employee.date,
      checkInTime: employee.checkInTime || "",
      checkOutTime: employee.checkOutTime || "",
      checkInTimeInISO: employee.checkInTimeInISO || "",
      checkOutTimeInISO: employee.checkOutTimeInISO || "",
      onLeave: employee.onLeave,
      leave_reason: employee.leave_reason,
      absent: employee.absent,
      approved: (approved as Approved) || Approved.PENDING,
      leaveType: employee.leaveType,
    };
    const newData: ILeaveType = {
      date: employee.date,
      leaveType: employee.leaveType as ILT,
    };
    await leaveColl.findOneAndUpdate(
      { _id: mongoId },
      {
        $set: {
          ...data,
          approved: approved as Approved,
        },
      },
      { returnDocument: "after" }
    );
    const employeeColl = await getCollection<IEmployee>(
      "Employee",
      hospitalId?.toString()
    );
    await employeeColl.findOneAndUpdate(
      { _id: new ObjectId(employee.empId) },
      {
        $inc: {
          "HR.no_of_leave": 1,
        },
        $push: {
          "HR.attendance": data,
          allLeave: {
            date: employee.date,
            leaveType: employee.leaveType,
          },
        },
      },
      { returnDocument: "after" }
    );
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    return res.status(201).json({
      success: true,
      message: "Leave approved successfully",
      data: employee,
    });
  } catch (error: any) {
    console.error("Error in approving the leave", error);
    return res.status(500).json({
      success: false,
      message: "Error in approving the leave",
      error: error.message,
    });
  }
};

export const getAllLeaves = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.query;
    const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
    const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
    const limit = upperLimit - lowerLimit; // Calculate the limit for the query

    if (limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid range: upperLimit must be greater than lowerLimit"
      });
    }
    const leaveColl = await getCollection<IAttendance>(
      "Leaves",
      hospitalId?.toString()
    );
    const leaves = await leaveColl.find().skip(lowerLimit).limit(limit).toArray();
    if (!leaves) {
      return res.status(404).json({
        success: true,
        message: "No leaves found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Leaves fetched successfully",
      data: leaves,
    });
  } catch (error: any) {
    console.error("Error in fetching the leaves", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching the leaves",
      error: error.message,
    });
  }
};

function getDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const currentDate = new Date(startDate);
  const endDateObj = new Date(endDate);

  while (currentDate <= endDateObj) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

export const updatePendingPayroll = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;

    if (!hospitalId || !id) {
      return res.status(400).json({
        success: false,
        message: "Missing hospitalId or id in the query parameters.",
      });
    }

    const mongoid = new ObjectId(id as string);
    const employeeColl = await getCollection<IEmployee>(
      "Employee",
      hospitalId.toString()
    );

    const employee = await employeeColl.findOne({ _id: mongoid });
    if (!employee) {
      return res.status(404).json({
        success: true,
        message: "Employee not found.",
      });
    }

    let total_paid_salary = employee.HR.total_paid_salary || 0;
    let updatedHistoryPayroll = employee.HR.history_payroll.map((payroll) => {
      if (payroll.status === payrollStatus.PENDING) {
        payroll.status = payrollStatus.PAID;
        total_paid_salary +=
          employee.HR.salary + payroll.allowances - payroll.deductions;
      }
      return payroll;
    });

    const result = await employeeColl.findOneAndUpdate(
      { _id: mongoid },
      {
        $set: {
          "HR.history_payroll": updatedHistoryPayroll,
          "HR.total_payable_salary": 0,
          "HR.total_paid_salary": total_paid_salary,
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(500).json({
        success: false,
        message: "Failed to update employee record.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pending payroll updated successfully.",
      data: result,
    });
  } catch (error: any) {
    console.error("Error in updating the pending payroll:", error);
    return res.status(500).json({
      success: false,
      message: "Error in updating the pending payroll",
      error: error.message,
    });
  }
};

export const createDutyRoaster = async (req: Request, res: Response) => {
  try {
    const {
      hospitalId,
      date,
      shift,
      employeeId,
      location,
      availability,
      start,
      end,
    } = req.body;

    const employeeColl = await getCollection<IEmployee>(
      "Employee",
      hospitalId?.toString()
    );
    const dutyRosterColl = await getCollection<IDutyRoster>(
      "Employee",
      hospitalId?.toString()
    );

    const findEmployee = await employeeColl.findOne({
      "ContactDetails.employeeId": employeeId,
    });
    if (!findEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    const newDutyRoster: IDutyRoster = {
      date: new Date(date).toISOString().split("T")[0], // Store date in ISO format
      shift: shift,
      employeeId: employeeId,
      location: location,
      availability: availability,
      start: start,
      end: end,
      isOvertime: false,
      isSwitched: false,
      switchEmpId: "",
      overTime: 0,
      approved: false
    };
    const result = await dutyRosterColl.findOneAndUpdate(
      { "ContactDetails.employeeId": employeeId },
      {
        $push: {
          "HR.dutyRoster": newDutyRoster,
        },
      },
      { returnDocument: "after" }
    );
    if (result) {
      return res.status(200).json({
        success: true,
        message: "Duty roster created successfully",
        data: result,
      });
    }
  } catch (error) {
    console.error("Error in creating the duty roster", error);
    return res.status(500).json({
      success: false,
      message: "Error in creating the duty roster",
    });
  }
};

export const addMultipleDutyRoster = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const employeeColl = await getCollection<IEmployee>(
      "Employee",
      hospitalId?.toString()
    );
    let employee = await employeeColl.findOne({ _id: mongoId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "No employees found",
      });
    }

    const dutyRoster = employee.HR.dutyRoster;

    let newDutyRoster: IDutyRoster[];

    newDutyRoster = req.body.dutyRoster;

    for (let roster of newDutyRoster) {
      dutyRoster.push(roster);
    }

    employee = await employeeColl.findOneAndUpdate(
      { _id: mongoId },
      { $set: { "HR.dutyRoster": dutyRoster } },
      { returnDocument: "after" }
    );

    return res.status(200).json({
      success: true,
      message: "Duty roster added successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Error in adding the duty roster", error);
    return res.status(500).json({
      success: false,
      message: "Error in adding the duty roster",
    });
  }
};

export const getAllDutyRoster = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.query;
    const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
    const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
    const limit = upperLimit - lowerLimit; // Calculate the limit for the query

    if (limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid range: upperLimit must be greater than lowerLimit"
      });
    }
    const employeeColl = await getCollection<IEmployee>(
      "Employee",
      hospitalId?.toString()
    );
    const employees = await employeeColl.find().skip(lowerLimit).limit(limit).toArray();
    if (!employees) {
      return res.status(404).json({
        success: false,
        message: "No duty roster found",
      });
    }

    let allDutyRoster = [];

    for (let employee of employees) {
      allDutyRoster.push(...employee.HR.dutyRoster);
    }

    return res.status(200).json({
      success: true,
      message: "Duty roster fetched successfully",
      data: allDutyRoster,
    });
  } catch (error) {
    console.error("Error in fetching the duty roster", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching the duty roster",
    });
  }
};

export const getAllDutyRosterByDate = async (req: Request, res: Response) => {
  try {
    const { hospitalId, date } = req.query;
    const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
    const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
    const limit = upperLimit - lowerLimit; // Calculate the limit for the query

    if (limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid range: upperLimit must be greater than lowerLimit"
      });
    }
    const employeeColl = await getCollection<IEmployee>(
      "Employee",
      hospitalId?.toString()
    );
    const employees = await employeeColl.find().skip(lowerLimit).limit(limit).toArray();
    if (!employees) {
      return res.status(404).json({
        success: false,
        message: "No duty roster found",
      });
    }

    const allDutyRoster: IDutyRoster[] = [];

    for (let employee of employees) {
      let dutyRoster = employee.HR.dutyRoster.filter(
        (roster) => roster.date === date
      );
      allDutyRoster.push(...dutyRoster);
    };

    return res.status(200).json({
      success: true,
      message: "Duty roster by date fetched successfully",
      data: allDutyRoster,
    });
  } catch (error) {
    console.error("Error in fetching the duty roster", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching the duty roster",
    });
  }
};

export const getDutyRoasterOfEmployee = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const dutyRosterColl = await getCollection<IEmployee>(
      "Employee",
      hospitalId?.toString()
    );

    const dutyRoster = await dutyRosterColl.findOne({
      _id: mongoId,
    });
    if (!dutyRoster) {
      return res.status(404).json({
        success: false,
        message: "Duty roster not found",
      });
    }

    const data = dutyRoster.HR.dutyRoster.map((roster) => ({
      return: {
        date: roster.date,
        shift: roster.shift,
        employeeId: roster.employeeId,
        location: roster.location,
        availability: roster.availability,
        start: roster.start,
        end: roster.end,
      },
    }));

    return res.status(200).json({
      success: true,
      message: "Duty roster fetched successfully",
      data: data,
    });
  } catch (error) {
    console.error("Error in fetching the duty roster", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching the duty roster",
    });
  }
};

// need to clear the update logic a bit more
export const updateDutyRoaster = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id, date } = req.query;
    const { shift, employeeId, location, availability, start, end, isOvertime, isSwitched, isApproved, overTime, approved, switchEmpId } = req.body;

    // Input validation
    if (!date || !hospitalId || !id) {
      return res.status(400).json({
        success: false,
        message: "Please provide the date, hospitalId and id",
      });
    }
    if (hospitalId?.toString().substring(0, 3) !== "hos") {
      return res.status(400).json({
        success: false,
        message: "Invalid hospitalId",
      });
    }

    const mongoId = new ObjectId(id as string);
    const dutyRoster: IDutyRoster = {
      date: date?.toString(),
      shift,
      employeeId,
      location,
      availability,
      start,
      end,
      isOvertime,
      isSwitched,
      switchEmpId,
      overTime,
      approved
    };

    const DRColl = await getCollection<IEmployee>(
      "Employee",
      hospitalId?.toString()
    );

    // Update the duty roster for the specific date
    const result = await DRColl.findOneAndUpdate(
      {
        _id: mongoId,
        "HR.dutyRoster.date": date,
      },
      {
        $set: {
          "HR.dutyRoster.$": dutyRoster,
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Employee or duty roster for the specified date not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Duty roster updated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error in updating the duty roster", error);
    return res.status(500).json({
      success: false,
      message: "Error in updating the duty roster",
    });
  }
};

export const markGazettedLeaves = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.query;
    const leavesColl = await getCollection<IGazettedLeaves>(
      "GazettedLeaves",
      hospitalId?.toString()
    );
    const leave = await leavesColl.findOne();
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    const { date, occasion } = req.body;
    const data: IGazettedLeaves = {
      date: date,
      occasion: occasion,
    };
    const result = await leavesColl.insertOne(data);
    return res.status(200).json({
      success: true,
      message: "Gazetted leaves marked successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error in marking the gazetted leaves", error);
    return res.status(500).json({
      success: false,
      message: "Error in marking the gazetted leaves",
    });
  }
};

export const getGazettedLeaves = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.query;
    const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
    const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
    const limit = upperLimit - lowerLimit; // Calculate the limit for the query

    if (limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid range: upperLimit must be greater than lowerLimit"
      });
    }
    const leavesColl = await getCollection<IGazettedLeaves>(
      "GazettedLeaves",
      hospitalId?.toString()
    );
    const leaves = await leavesColl.find().skip(lowerLimit).limit(limit).toArray();
    if (!leaves) {
      return res.status(404).json({
        success: true,
        message: "No gazetted leaves found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Gazetted leaves fetched successfully",
      data: leaves,
    });
  } catch (error: any) {
    console.error("Error in fetching the gazetted leaves", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching the gazetted leaves",
      error: error.message,
    });
  }
};

export const addAndUpdatePerformanceRemark = async (
  req: Request,
  res: Response
) => {
  try {
    let { hospitalId, id, date } = req.query;
    const mongoId = new ObjectId(id as string);
    date = date?.toString();
    const employeeColl = await getCollection<IEmployee>(
      "Employee",
      hospitalId?.toString()
    );
    const employee = await employeeColl.findOne({ _id: mongoId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    const data = req.body;
    if (date !== undefined || date === "") {
      const performance_remarks = employee.HR.performance_remarks;
      const result = await employeeColl.findOneAndUpdate(
        {
          _id: mongoId,
          "HR.performance_remarks.date": date,
        },
        {
          $set: {
            "HR.performance_remarks.$": data,
          },
        },
        { returnDocument: "after" }
      );
      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Performance remark updated successfully",
        data: result,
      });
    } else {
      const result = await employeeColl.findOneAndUpdate(
        { _id: mongoId },
        {
          $push: {
            "HR.performance_remarks": data,
          },
        },
        { returnDocument: "after" }
      );
      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Performance remark added and updated successfully",
        data: result,
      });
    }
  } catch (error: any) {
    console.error("Error in adding and updating the performance remark", error);
    return res.status(500).json({
      success: false,
      message: "Error in adding and updating the performance remark",
      error: error.message,
    });
  }
};

export const addHistoryPayrolls = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const { allowances, deductions, status, payment_dates } = req.body;
    const employeeColl = await getCollection<IEmployee>(
      "Employee",
      hospitalId?.toString()
    );

    const employee = await employeeColl.findOne({ _id: mongoId });

    if (!employee) {
      return res.status(404).json({
        success: true,
        message: "Employee not found",
      });
    }

    const data: IPayroll = {
      allowances,
      deductions,
      status,
      payment_dates,
    };
    const result = await employeeColl.findOneAndUpdate(
      { _id: mongoId },
      {
        $push: {
          "HR.history_payroll": data,
        },
      },
      { returnDocument: "after" }
    );
    if (!result) {
      return res.status(500).json({
        success: false,
        message: "Employee not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "History payroll added successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error in adding the history payroll", error);
    return res.status(500).json({
      success: false,
      message: "Error in adding the history payroll",
      error: error.message,
    });
  }
};

export const clearAttendance = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const employeeColl = await getCollection<IEmployee>(
      "Employee",
      hospitalId?.toString()
    );
    const employee = await employeeColl.findOne({ _id: mongoId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    const { ContactDetails, HR } = employee;
    const contactDetails = {
      employeeId: ContactDetails.employeeId,
      name: ContactDetails.name,
      dateOfBirth: ContactDetails.dateOfBirth,
      email: ContactDetails.email,
      phoneNumber: ContactDetails.phoneNumber,
      address: ContactDetails.address,
      gender: ContactDetails.gender,
      username: ContactDetails.username,
    };

    const result = await employeeColl.findOneAndUpdate(
      { _id: mongoId },
      {
        $set: {
          hospitalId: hospitalId?.toString(),
          ContactDetails: contactDetails,
          "HR.attendance": [],
          "HR.no_of_leave": 0,
        },
      },
      { returnDocument: "after" }
    );

    return res.status(200).json({
      success: true,
      message: "Attendance cleared successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error in clearing the attendance", error);
    return res.status(500).json({
      success: false,
      message: "Error in clearing the attendance",
      error: error.message,
    });
  }
};

export const onBoardDoctor = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const { doctorName, username, phoneNumber } = req.body;

    if (!hospitalId || !id || !doctorName || !username || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const mongoId = new ObjectId(id as string);
    const employeeColl = await getCollection<IEmployee>(
      "Employee",
      hospitalId?.toString()
    );
    const employee = await employeeColl.findOne({ _id: mongoId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found, please onboard the employee first",
      });
    }

    const doctorColl = await getCollection<IDoctor>("DoctorList", null);
    const doctor = await doctorColl.findOne({
      doctorName: doctorName?.toString(),
      doctorUsername: username?.toString(),
      phoneNumber: phoneNumber?.toString(),
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found. Please insert the doctor for DocApp first",
      });
    }
    const isHospitalIdPresent = doctor.listOfHospitals.includes(
      hospitalId?.toString()
    );

    if (!isHospitalIdPresent) {
      const result = await doctorColl.findOneAndUpdate(
        {
          doctorName: doctorName?.toString(),
          username: username?.toString(),
          phoneNumber: phoneNumber?.toString(),
        },
        {
          $push: {
            listOfHospitals: hospitalId?.toString(),
          },
        },
        { returnDocument: "after" }
      );

      return res.status(200).json({
        success: true,
        message: "Doctor onboarded successfully",
        doctor: result,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Doctor already onboarded",
      });
    }
  } catch (error: any) {
    console.error("Error in onboarding the doctor", error);
    return res.status(500).json({
      success: false,
      message: "Error in onboarding the doctor",
      error: error.message,
    });
  }
};

export const getSwitchedDuty = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.query;
    const lowerLimit = parseInt(req.query.lowerlimit as string) || 0;
    const upperLimit = parseInt(req.query.upperlimit as string) || 1000;
    const limit = upperLimit - lowerLimit;

    if (limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid range : upperLimit must be greater then lowerLimit",
      });
    }

    const switchColl = await getCollection<INotification>(
      "DutySwitchNotification",
      hospitalId?.toString()
    );

    const switched = await switchColl.find({}).skip(lowerLimit).limit(limit).toArray();

    if (switched.length == 0) {
      return res.status(404).json({
        success: false,
        message: "Switch not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Switched duties fetched successfully",
      data: switched,
    });

  } catch (error: any) {
    console.error("Error in fetching the switched duty", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching the switched duty",
    });
  }
};

export const approveSwitchedDuty = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const { availableEmpId } = req.body;


    if (!hospitalId || !id || !availableEmpId) {
      return res.status(400).json({
        success: false,
        message: "Please Provide all required fields(hospitalId,id,isApproved,availableEmpId)",
      });
    }

    const mongoId = new ObjectId(id as string);

    const switchColl = await getCollection<INotification>(
      "DutySwitchNotification",
      hospitalId?.toString()
    );

    const existingSwitch = await switchColl.findOne({ _id: mongoId });

    if (!existingSwitch) {
      return res.status(404).json({
        success: false,
        message: "Switch request not found",
      });
    }

    if (existingSwitch.approved) {
      return res.status(400).json({
        success: false,
        message: "Switch request already approved",
      });
    }

    const updatedSwitch = await switchColl.findOneAndUpdate(
      { _id: mongoId },
      {
        $set: {
          approved: true,
          asssignedEmpId: availableEmpId,
        },
      },
      { returnDocument: 'after' }
    );

    if (!updatedSwitch) {
      console.error("Update failed, switch request not found or not updated.");
      return res.status(500).json({
        success: false,
        message: "Failed to update switch request",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Switch request approved successfully",
      data: updatedSwitch,
    });
  } catch (error: any) {
    console.error("Error in approving the switched duty", error);
    return res.status(500).json({
      success: false,
      message: "Error in approving the switched duty",
    });
  }
};

// incomplete logic
export const findAvailableEmployees = async (req: Request, res: Response) => {
  try {
    const { hospitalId, date } = req.query;
    const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
    const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
    const limit = upperLimit - lowerLimit; // Calculate the limit for the query

    if (limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid range: upperLimit must be greater than lowerLimit"
      });
    }

    if (!hospitalId || !date) {
      return res.status(400).json(
        {
          success: true,
          message: "Required fields are empty"
        }
      )
    }
    const checkDate = new Date(date.toString())
    const employeeColl = await getCollection<IEmployee>(
      "Employee",
      hospitalId?.toString()
    );
    const employees = await employeeColl.find().skip(lowerLimit).limit(limit).toArray();
    if (!employees) {
      return res.status(404).json({
        success: false,
        message: "No employees found",
      });
    }

    const availableEmployees: IEmployee[] = [];

    // const availableEmployees = employees.filter(
    //   (employee) => employee.HR.attendance.every(attendance => new Date(attendance.date.toString().split))
    // );

    for (let employee of employees) {
      const latestAttendance = employee.HR.attendance[employee.HR.attendance.length - 1];
      const latestDate = latestAttendance ? latestAttendance.date.toString() : null;
      if (latestDate) {
        const latestDateFormated = new Date(latestDate);
        if (latestDateFormated.getDate() == checkDate.getDate() && latestDateFormated.getMonth() == checkDate.getMonth() && latestDateFormated.getFullYear() == checkDate.getFullYear()) {
          if (!latestAttendance.absent && !latestAttendance.onLeave) {
            availableEmployees.push(employee);
          }
        }
      }

    }

    return res.status(200).json({
      success: true,
      message: "Available employees fetched successfully",
      data: availableEmployees,
    });
  } catch (error: any) {
    console.error("Error in fetching the available employees", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching the available employees",
    });
  }
};

export const deleteDutyRoster = async (req: Request, res: Response) => {
  try {
    const { hospitalId, employeeId, date, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const employeeColl = await getCollection<IEmployee>("Employee", hospitalId?.toString());
    const employee = await employeeColl.findOne({ _id: mongoId, "HR.dutyRoster.date": date, "ContactDetails.employeeId": employeeId?.toString() });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      })
    }
    const updatedDutyRoster = employee.HR.dutyRoster.filter((roster) => roster.date !== date);
    const result = await employeeColl.findOneAndUpdate(
      { _id: mongoId },
      { $set: { "HR.dutyRoster": updatedDutyRoster } },
      { returnDocument: "after" }
    );
    return res.status(200).json({
      success: true,
      message: "Duty roster deleted successfully",
      data: result
    })
  } catch (error: any) {
    console.error("Error in deleting the duty roster", error);
    return res.status(500).json({
      success: false,
      message: "Error in deleting the duty roster"
    })
  }
}

export const getOverTime = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.query;
    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "hospitalId and empId are required query parameters"
      })
    }
    const userColl = await getCollection<IOverTime>("OverTimeRequest", hospitalId?.toString());
    const overTime = await userColl.find({ approved: false }).toArray();
    if (!overTime) {
      return res.status(404).json({
        success: false,
        message: "Overtime not found"
      })
    }
    return res.status(200).json({
      success: true,
      message: "Overtime fetched successfully",
      data: overTime
    })
  } catch (error: any) {
    console.error("Error in fetching the overtime", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching the overtime"
    })
  }
}


export const approveOverTime = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;

    if (!hospitalId || !id) {
      return res.status(400).json({
        success: false,
        message: "hospitalId and id are required query parameters"
      });
    }

    const mongoId = new ObjectId(id as string);

    // Get the overtime request
    const overtimeColl = await getCollection<IOverTime>("OverTimeRequest", hospitalId.toString());
    const overtimeRequest = await overtimeColl.findOne({ _id: mongoId });

    if (!overtimeRequest) {
      return res.status(404).json({
        success: false,
        message: "Overtime request not found"
      });
    }

    // Get the employee data
    const employeeColl = await getCollection<IEmployee>("Employee", hospitalId.toString());
    const employee = await employeeColl.findOne({ _id: new ObjectId(overtimeRequest.empId) });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found"
      });
    }

    // Find the duty for the requested date
    const findDutyAtDate = employee.HR.dutyRoster.find(duty => duty.date === overtimeRequest.date);

    if (!findDutyAtDate) {
      return res.status(404).json({
        success: false,
        message: "No duty found for the requested date"
      });
    }

    console.log("Original end time:", findDutyAtDate.end);

    // Parse the date and end time correctly
    try {
      // Get the base date from the duty roster date
      const [year, month, day] = overtimeRequest.date.split('-').map(Number);
      let originalEndDateTime;

      // Handle different possible end time formats
      if (typeof findDutyAtDate.end === 'string') {
        if (findDutyAtDate.end.includes('T')) {
          // Full ISO format
          originalEndDateTime = new Date(findDutyAtDate.end);
        } else if (findDutyAtDate.end.includes(':')) {
          // Time-only format (HH:MM or HH:MM:SS)
          const timeParts = findDutyAtDate.end.split(':');
          const hours = parseInt(timeParts[0], 10);
          const minutes = parseInt(timeParts[1], 10);
          const seconds = timeParts.length > 2 ? parseInt(timeParts[2], 10) : 0;

          originalEndDateTime = new Date(year, month - 1, day, hours, minutes, seconds);
        } else {
          // Assume it's a timestamp or other format
          originalEndDateTime = new Date(findDutyAtDate.end);
        }
      } else if (findDutyAtDate.end) {
        originalEndDateTime = findDutyAtDate.end;
      } else {
        throw new Error("End time format is not recognized");
      }

      // Validate parsed date
      if (isNaN(originalEndDateTime.getTime())) {
        throw new Error("Invalid end time format: " + findDutyAtDate.end);
      }

      console.log("Parsed original end time:", originalEndDateTime);

      // Add overtime hours to end time
      const overtimeHours = overtimeRequest.overTime || 0;
      const updatedEndDateTime = new Date(originalEndDateTime.getTime() +
        overtimeHours * 60 * 60 * 1000); // Convert hours to milliseconds

      console.log("Updated end time:", updatedEndDateTime);

      // Format the end time based on the original format
      let overtimeEndTime;
      if (typeof findDutyAtDate.end === 'string' && findDutyAtDate.end.includes('T')) {
        // Full ISO format
        overtimeEndTime = updatedEndDateTime.toISOString();
      } else if (typeof findDutyAtDate.end === 'string' && findDutyAtDate.end.includes(':')) {
        // Time-only format - keep it as time only
        overtimeEndTime = `${updatedEndDateTime.getHours().toString().padStart(2, '0')}:${updatedEndDateTime.getMinutes().toString().padStart(2, '0')}:${updatedEndDateTime.getSeconds().toString().padStart(2, '0')}`;
      } else {
        // For other formats, use ISO string
        overtimeEndTime = updatedEndDateTime.toISOString();
      }

      // If using ISO format, remove Z suffix if original doesn't have it
      if (typeof findDutyAtDate.end === 'string' && findDutyAtDate.end.includes('T') &&
        !findDutyAtDate.end.endsWith('Z') && overtimeEndTime.endsWith('Z')) {
        overtimeEndTime = overtimeEndTime.slice(0, -1);
      }

      console.log("Formatted end time:", overtimeEndTime);

      // Update the employee's extra working hours total
      await employeeColl.updateOne(
        { _id: new ObjectId(overtimeRequest.empId) },
        {
          $inc: { "HR.extra_working_hours": overtimeRequest.overTime || 0 },
        }
      );

      // Update the specific duty roster entry with the new end time
      await employeeColl.updateOne(
        {
          _id: new ObjectId(overtimeRequest.empId),
          "HR.dutyRoster": {
            $elemMatch: {
              date: overtimeRequest.date,
              employeeId: employee.ContactDetails.employeeId,
              start: findDutyAtDate.start
            }
          }
        },
        {
          $set: {
            "HR.dutyRoster.$.end": overtimeEndTime,
            "HR.dutyRoster.$.isOvertime": true,
            "HR.dutyRoster.$.overTime": overtimeRequest.overTime,
            "HR.dutyRoster.$.approved": true
          }
        }
      );

      // Update the overtime request status to approved
      const updatedOvertime = await overtimeColl.findOneAndUpdate(
        { _id: mongoId },
        {
          $set: {
            approved: true
          }
        },
        { returnDocument: "after" }
      );

      if (!updatedOvertime) {
        return res.status(500).json({
          success: false,
          message: "Failed to update overtime request status"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Overtime approved successfully",
        data: {
          ...updatedOvertime,
          startTime: findDutyAtDate.start,
          endTime: overtimeEndTime,
          overTime: overtimeRequest.overTime
        }
      });

    } catch (parseError: any) {
      console.error("Error parsing dates:", parseError);
      return res.status(500).json({
        success: false,
        message: "Error parsing date/time values",
        error: parseError.message
      });
    }

  } catch (error: any) {
    console.error("Error in approving overtime:", error);
    return res.status(500).json({
      success: false,
      message: "Error in approving overtime",
      error: error.message
    });
  }
}



export const addSupervisor = async (req: Request, res: Response) => {
  try {
    const { hospitalId, username, id, isDoctor } = req.query;
    const mongoId = new ObjectId(id as string);
    const employeeColl = await getCollection<IEmployee>("Employee", hospitalId?.toString());
    const employee = await employeeColl.findOne({ _id: mongoId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    const updatedEmployee = await employeeColl.findOneAndUpdate({
      _id: mongoId,
    }, {
      $addToSet: {
        "HR.supervisor": username?.toString(),
      },
    }, { returnDocument: "after" });
    if (isDoctor === "true") {
      const doctorColl = await getCollection<IDoctor>("DoctorList", null);
      const supervisorDoctor = await doctorColl.findOne({ doctorUsername: username?.toString() });
      const subordinateDoctor = await doctorColl.findOne({ phoneNumber: employee.ContactDetails.phoneNumber });
      if (!supervisorDoctor || !subordinateDoctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }
      const updatedDoctor = await doctorColl.findOneAndUpdate({
        doctorUsername: username?.toString(),
      }, {
        $addToSet: {
          subOrdinates: subordinateDoctor.doctorUsername?.toString(),
        },
      }, { returnDocument: "after" });
      const updatedSubordinate = await doctorColl.findOneAndUpdate({
        phoneNumber: employee.ContactDetails.phoneNumber,
      }, {
        $addToSet: {
          supervisors: supervisorDoctor.doctorUsername?.toString(),
        },
      }, { returnDocument: "after" });
    }
    return res.status(200).json({
      success: true,
      message: "Supervisor added successfully",
      data: updatedEmployee,
    });
  } catch (error: any) {
    console.error("Error in adding supervisor", error);
    return res.status(500).json({
      success: false,
      message: "Error in adding supervisor",
    })
  }
}


export const addUsernameToEmployeeContactDetails = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.query;
    const employeeColl = await getCollection<IEmployee>("Employee", hospitalId as string);
    const employees = await employeeColl.find({}).toArray();
    let updatedEmployees = [];
    if (!employees) {
      return res.status(404).json({
        success: false,
        message: "No employees found",
      });
    }
    for (let employee of employees) {
      const updatedEmployee = await employeeColl.findOneAndUpdate({
        _id: employee._id,
      }, {
        $set: {
          "ContactDetails.username": getUsername(employee.ContactDetails.name?.toString(), employee.ContactDetails.phoneNumber?.toString()),
          "HR.supervisor": []
        },
      }, { returnDocument: "after" });
      updatedEmployees.push(updatedEmployee);
    }
    return res.status(200).json({
      success: true,
      message: "Username added to employee contact details successfully",
      data: updatedEmployees,
    });
  } catch (error: any) {
    console.error("Error in adding username to employee contact details", error);
    return res.status(500).json({
      success: false,
      message: "Error in adding username to employee contact details",
    })
  }
}

export const utilsFuncion = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.query;
    const employeeColl = await getCollection<IEmployee>("Employee", hospitalId?.toString());
    const doctorColl = await getCollection<IDoctor>("DoctorList", null);

    const employees = await employeeColl.find({
      $or: [
        { "HR.role": { $regex: "Doctor", $options: "i" } },
        { "HR.role": { $regex: "Consultant", $options: "i" } }
      ]
    }).toArray();

    const mapEmployeeToDoctor: IDoctor[] = await Promise.all(
      employees.map(async (employee) => {
        return {
          hospitalId: "",
          doctorName: employee.ContactDetails.name ?? "",
          doctorUsername: await getUsername(employee.ContactDetails.name ?? "", employee.ContactDetails.phoneNumber ?? ""),
          email: employee.ContactDetails.email ?? "",
          password: Math.floor(1000 + Math.random() * 9000).toString(),
          phoneNumber: employee.ContactDetails.phoneNumber ?? "",
          mode: IModes.FULLTIME,
          specialization: employee.HR.department ?? "",
          profileUrl: "",
          address: employee.ContactDetails.address ?? "",
          department: (employee.HR.department as EDepartment) ?? EDepartment.OTHER,
          listOfHospitals: [hospitalId?.toString() ?? ""],
        };
      })
    );

    // Process each doctor separately to handle duplicates properly
    const results = await Promise.all(
      mapEmployeeToDoctor.map(async (doctorData) => {
        try {
          // Check if doctor already exists (by phoneNumber)
          const existingDoctor = await doctorColl.findOne({
            phoneNumber: doctorData.phoneNumber
          });

          if (existingDoctor) {
            // Doctor exists, check if hospital needs to be added to listOfHospitals
            if (!existingDoctor.listOfHospitals.includes(hospitalId?.toString() ?? "")) {
              // Add the hospitalId to existing doctor's listOfHospitals
              await doctorColl.updateOne(
                { phoneNumber: doctorData.phoneNumber },
                { $addToSet: { listOfHospitals: hospitalId?.toString() ?? "" } }
              );
              return {
                success: true,
                action: "updated",
                phoneNumber: doctorData.phoneNumber
              };
            } else {
              // Hospital already in listOfHospitals, ignore
              return {
                success: true,
                action: "ignored",
                phoneNumber: doctorData.phoneNumber
              };
            }
          } else {
            // Doctor doesn't exist, insert new record
            await doctorColl.insertOne(doctorData);
            return {
              success: true,
              action: "inserted",
              phoneNumber: doctorData.phoneNumber
            };
          }
        } catch (error) {
          console.error(`Error processing doctor with phone ${doctorData.phoneNumber}:`, error);
          return {
            success: false,
            action: "error",
            phoneNumber: doctorData.phoneNumber,
            error
          };
        }
      })
    );

    // Count the different actions for response
    const stats = results.reduce((acc, result) => {
      acc[result.action] = (acc[result.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return res.status(200).json({
      success: true,
      message: "Doctors processed successfully",
      stats,
      details: results
    });
  } catch (error) {
    console.error("Error adding doctor from employee:", error);
    res.status(500).json({
      success: false,
      message: "Error adding doctor from employee",
    });
  }
}
/**
 * A generic controller to update collection documents according to schema changes
 * @param T The type of the collection documents
 * @param transformFn A function that transforms old document to match new schema
 * @returns Express controller function
 */
export const createSchemaUpdateController = <T extends Document>(
  collectionName: string,
  transformFn: (doc: any) => Record<string, any>
) => {
  return async (req: Request, res: Response) => {
    try {
      console.log(`[DEBUG] Starting schema update for collection: ${collectionName}`);

      const hospitalColl = await getCollection<IHospital>("Hospitals", null);
      console.log(`[DEBUG] Hospital collection obtained successfully`);

      const hospitals = await hospitalColl.find({}).toArray();
      console.log(`[DEBUG] Found ${hospitals.length} hospitals in database`);
      console.log(`[DEBUG] Hospital data:`, hospitals.map(h => ({ hospitalId: h.hospitalId, name: h.name || 'No name' })));

      let totalUpdatedDocuments = 0;
      const updateResults: any[] = [];

      for (const hospital of hospitals) {
        const hospitalId = hospital.hospitalId;
        console.log(`[DEBUG] Processing hospital: ${hospitalId}`);

        try {
          const collection = await getCollection<Document & IEmployee>(collectionName, hospitalId.toString());
          console.log(`[DEBUG] Collection obtained for hospital ${hospitalId}`);

          const documents = await collection.find({}).toArray();
          console.log(`[DEBUG] Found ${documents.length} documents in ${collectionName} collection for hospital ${hospitalId}`);

          if (!documents || documents.length === 0) {
            console.log(`[DEBUG] No ${collectionName} documents found for hospital ${hospitalId} - skipping`);
            updateResults.push({
              hospitalId: hospitalId,
              updatedCount: 0,
              totalDocuments: 0,
              status: 'No documents found'
            });
            continue; // Skip this hospital and continue with next one
          }

          console.log(`[DEBUG] Sample document structure for hospital ${hospitalId}:`, JSON.stringify(documents[0], null, 2));

          const updatePromises = documents.map(async (doc) => {
            try {
              const updateFields = transformFn(doc);
              console.log(`[DEBUG] Transform function result for document ${doc._id}:`, JSON.stringify(updateFields, null, 2));

              // Check if there are any fields to update
              if (Object.keys(updateFields).length === 0) {
                console.log(`[DEBUG] No fields to update for document ${doc._id} - skipping update`);
                return doc; // Return original doc as "updated"
              }

              const updatedDoc = await collection.findOneAndUpdate(
                { _id: doc._id },
                { $set: updateFields },
                { returnDocument: "after" }
              );

              console.log(`[DEBUG] Document ${doc._id} updated successfully`);
              return updatedDoc;
            } catch (docError) {
              console.error(`[ERROR] Error updating document ${doc._id} in hospital ${hospitalId}:`, docError);
              return null; // Return null for failed updates
            }
          });

          const updatedDocuments = await Promise.all(updatePromises);
          const successfulUpdates = updatedDocuments.filter(doc => doc !== null);

          console.log(`[DEBUG] Hospital ${hospitalId} - Updated: ${successfulUpdates.length}/${documents.length} documents`);

          totalUpdatedDocuments += successfulUpdates.length;
          updateResults.push({
            hospitalId: hospitalId,
            updatedCount: successfulUpdates.length,
            totalDocuments: documents.length,
            status: 'Completed'
          });

        } catch (hospitalError: any) {
          console.error(`[ERROR] Error processing hospital ${hospitalId}:`, hospitalError);
          updateResults.push({
            hospitalId: hospitalId,
            updatedCount: 0,
            error: hospitalError.message,
            status: 'Failed'
          });
        }
      }

      console.log(`[DEBUG] Final results - Total updated: ${totalUpdatedDocuments}, Hospitals processed: ${hospitals.length}`);
      console.log(`[DEBUG] Update results summary:`, updateResults);

      return res.status(200).json({
        success: true,
        message: `Successfully updated ${totalUpdatedDocuments} ${collectionName} documents across ${hospitals.length} hospitals`,
        data: {
          totalUpdated: totalUpdatedDocuments,
          hospitalResults: updateResults
        }
      });

    } catch (error: any) {
      console.error(`Error in updating ${collectionName} schema:`, error);
      return res.status(500).json({
        success: false,
        message: `Error in updating ${collectionName} schema`,
        error: error.message
      });
    }
  };
};

// Example of using the generic controller for your employee schema update
export const updateEmployeeSchema = createSchemaUpdateController<Document & IEmployee>(
  "Employee",
  (employee) => {
    // Create properly structured updates object using dot notation
    const updates: Record<string, any> = {};

    // Fix supervisor array check - check if it exists and is an array
    if (!employee.HR?.supervisor || !Array.isArray(employee.HR.supervisor)) {
      updates["HR.supervisor"] = [];
    }

    // Transform role from string to object structure
    if (employee.HR?.role) {
      const currentRole = employee.HR.role;

      // Check if role is already an object (already updated)
      if (typeof currentRole === 'string') {
        // Check if the role value is one of the enum values
        const isValidEnumRole = Object.values(IADMIN).includes(currentRole as IADMIN);

        updates["HR.role"] = {
          role: isValidEnumRole ? currentRole as IADMIN : IADMIN.DOCTOR, // Default to DOCTOR if not valid
          customName: currentRole
        };
      }
    }

    // Add new arrays if they don't exist
    if (!employee.HR?.subordinates || !Array.isArray(employee.HR.subordinates)) {
      updates["HR.subordinates"] = [];
    }

    if (!employee.HR?.roleAccess || !Array.isArray(employee.HR.roleAccess)) {
      updates["HR.roleAccess"] = ["Dashboard", "Emergency", "OPD", "Equipments", "IPD", "Inventory"];
    }

    return updates;
  }
);



export const updateEmployeeRoleAccessFromMongoId = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const roleAccess = req.body;
    const employeeColl = await getCollection<IEmployee>("Employee", hospitalId?.toString());
    const employee = await employeeColl.findOne({ _id: mongoId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    const updatedEmployee = await employeeColl.findOneAndUpdate({
      _id: mongoId,
    }, {
      $set: {
        "HR.roleAccess": roleAccess,
      },
    }, { returnDocument: "after" });
    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Employee role access updated successfully",
      data: updatedEmployee,
    });
  } catch (error: any) {
    console.error("Error in updating employee role access from mongoId", error);
    return res.status(500).json({
      success: false,
      message: "Error in updating employee role access from mongoId",
    })
  }
}


export const updateEmployeeRoleAccessBasedOnRole = async (req: Request, res: Response) => {
  try {
    const { hospitalId, role } = req.query;
    const roleAccess = req.body;
    const employeeColl = await getCollection<IEmployee>("Employee", hospitalId?.toString());
    const employees = await employeeColl.find({
      "HR.role.role": role as IADMIN
    }).toArray();
    if (!employees) {
      return res.status(404).json({
        success: false,
        message: "No employees found with the given role",
      });
    }
    const updatedEmployees = await Promise.all(
      employees.map(async (employee) => {
        const updatedEmployee = await employeeColl.findOneAndUpdate({
          _id: employee._id,
        }, {
          $set: {
            "HR.roleAccess": roleAccess,
          },
        }, { returnDocument: "after" });
        return updatedEmployee;
      })
    );
    return res.status(200).json({
      success: true,
      message: "Employee role access updated successfully",
      data: updatedEmployees,
    });
  } catch (error: any) {
    console.error("Error in updating employee role access based on role", error);
    return res.status(500).json({
      success: false,
      message: "Error in updating employee role access based on role",
    })
  }
}



export const updateSubordinatesRoleAccess = async (req: Request, res: Response) => {
  try {
    const { hospitalId, username } = req.query;
    const employeeColl = await getCollection<IEmployee>("Employee", hospitalId?.toString());
    const employee = await employeeColl.findOne({ "ContactDetails.username": username as string });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    const roleAccess = req.body;
    const updatedEmployee = await employeeColl.findOneAndUpdate({
      "ContactDetails.username": username as string,
    }, {
      $set: {
        "HR.roleAccess": roleAccess,
      },
    }, { returnDocument: "after" });
    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Subordinates role access updated successfully",
      data: updatedEmployee,
    })
  } catch (error: any) {
    console.error("Error in updating subordinates role access", error);
    return res.status(500).json({
      success: false,
      message: "Error in updating subordinates role access",
    })
  }
}


export const getSubOrdinates = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongoId = new ObjectId(id as string);
    const employeeColl = await getCollection<IEmployee>("Employee", hospitalId?.toString());
    const employee = await employeeColl.findOne({ _id: mongoId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    const subordinates = employee.HR.subordinates;
    let subordinatesDetails = [];
    for (let subordinate of subordinates) {
      const subordinateDetails = await employeeColl.findOne({ "ContactDetails.username": subordinate });
      if (subordinateDetails) {
        subordinatesDetails.push(subordinateDetails);
      }
    }
    if (!subordinatesDetails) {
      return res.status(404).json({
        success: false,
        message: "No subordinates found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Subordinates fetched successfully",
      data: subordinatesDetails,
    });
  } catch (error: any) {
    console.error("Error in getting subordinates", error);
    return res.status(500).json({
      success: false,
      message: "Error in getting subordinates",
    })
  }
}