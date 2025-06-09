import { IAppointment, EventType, ILabScan, notify, NotifyLabScan, AppointmentStatus, SLOTINDEXES } from "./ScheduleModel";
import { getCollection } from "../../../db/db";
import { Request, Response } from "express";
import { Collection, ObjectId } from "mongodb";
import { IPatient } from "features/account/patients/PatientModel";
import { isValidObjectId } from "mongoose";
import { IHospital } from "features/auth/HospitalModel";
import { EDay, EEventType, IDoctor, ITimeSlot } from "../../account/doctors/DoctorModel";

export async function scheduleAppointment(
  newAppointment: IAppointment,
  appointmentColl: Collection<IAppointment>,
  availableSlots: string[] = SLOTINDEXES
): Promise<IAppointment> {

  try {
    let originalSlot: string = newAppointment.eventData.eventTimeSlot;
    let slotIndex: number = SLOTINDEXES.indexOf(originalSlot);
    const doctorUsername: string = newAppointment.doctorUsername.toString();
    const priority: number = newAppointment.eventData.priority

    console.log("[scheduleAppointment] originalSlot:", originalSlot, "slotIndex:", slotIndex, "doctorUsername:", doctorUsername, "priority:", priority);

    if (slotIndex === -1) {
      throw new Error(`Invalid time slot: ${originalSlot}`);
    }

    const hospitalColl = await getCollection<IHospital>("Hospitals", null);
    const hospital: any = await hospitalColl.findOne({ hospitalId: newAppointment.hospitalId })
    let appointmentPerSlot = -1;
    if (hospital) {
      appointmentPerSlot = hospital?.appointmentPerSlot
    }

    console.log("[scheduleAppointment] appointmentPerSlot:", appointmentPerSlot);

    let appts = await appointmentColl.find(
      {
        doctorUsername: doctorUsername,
        "eventData.priority": priority,
        "eventData.eventTimeSlot": originalSlot,
      }
    ).sort({ "eventData.appointment_number": -1 }).toArray();

    console.log("[scheduleAppointment] current appointments in slot", originalSlot, ":", appts.length);

    let nextSlot = originalSlot;
    let isAnySlotAvailable = true;

    if (
      appointmentPerSlot &&
      appointmentPerSlot != null &&
      appointmentPerSlot != undefined &&
      appointmentPerSlot != -1 &&
      appts.length >= appointmentPerSlot) {
      for (let slot of availableSlots) {
        isAnySlotAvailable = false;

        nextSlot = slot;
        if (nextSlot != originalSlot) {
          appts = await appointmentColl.find(
            {
              doctorUsername: doctorUsername,
              "eventData.priority": priority,
              "eventData.eventTimeSlot": nextSlot,
            }
          ).sort({ "eventData.appointment_number": -1 }).toArray();

          console.log("[scheduleAppointment] checking slot", nextSlot, "appointments:", appts.length);

          if (appts.length < appointmentPerSlot) {
            isAnySlotAvailable = true
            break;
          }
        }
      }
    }

    if (!isAnySlotAvailable) {
      console.log("[scheduleAppointment] No slot is available for the doctor");
      throw new Error("No slot is available for the doctor")
    }

    slotIndex = SLOTINDEXES.indexOf(nextSlot);
    let appointment_number = (slotIndex) * 1000;

    console.log("[scheduleAppointment] selected slot:", nextSlot, "slotIndex:", slotIndex, "base appointment_number:", appointment_number);

    if (appts.length != 0) {
      const lastAppointment = appts[0];
      appointment_number = lastAppointment.eventData.appointment_number + 1;
      console.log("[scheduleAppointment] lastAppointment found, new appointment_number:", appointment_number);
    }

    else {
      if (priority == 1) appointment_number += 1;
      if (priority == 2) appointment_number += 201;
      if (priority > 2) appointment_number += 401;
      console.log("[scheduleAppointment] first appointment in slot, calculated appointment_number:", appointment_number);
    }

    newAppointment.eventData.appointment_number = appointment_number;
    newAppointment.eventData.eventTimeSlot = nextSlot;

    console.log("[scheduleAppointment] final appointment object:", JSON.stringify(newAppointment, null, 2));

    return newAppointment;

  } catch (err) {
    console.error("[scheduleAppointment] Error scheduling appointment:", err);
    throw new Error(`Error scheduling appointment: ${err}`);
  }
}

export const getSlotFromTime = (isoTime: string): string => {
  // Strip 'Z' if present to avoid UTC conversion, treat as local time
  const cleanedTime = isoTime.endsWith("Z") ? isoTime.slice(0, -1) : isoTime;

  const date = new Date(cleanedTime);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid time format");
  }

  const hour = date.getHours();
  const minute = date.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  for (const slot of SLOTINDEXES) {
    const [startStr, endStr] = slot.split("-");
    const startHour = parseInt(startStr.slice(0, 2), 10);
    const startMinute = parseInt(startStr.slice(2, 4), 10);
    const endHour = parseInt(endStr.slice(0, 2), 10);
    const endMinute = parseInt(endStr.slice(2, 4), 10);

    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

    if (timeInMinutes >= startTotal && timeInMinutes < endTotal) {
      return slot;
    }
  }

  throw new Error("Time is outside of available slots");
}

export const getDayOfWeek = (isoTime: string): string => {
  const date = new Date(isoTime);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid ISO time string");
  }

  const daysOfWeek = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
  ];

  return daysOfWeek[date.getUTCDay()];
}

export const isSlotWithinSlots = (slots: string[], slotToCheck: string): boolean => {
  const parse = (timeStr: string): number => {
    const hours = parseInt(timeStr.slice(0, 2), 10);
    const minutes = parseInt(timeStr.slice(2, 4), 10);
    return hours * 60 + minutes;
  };

  const [checkStartStr, checkEndStr] = slotToCheck.split("-");
  const checkStart = parse(checkStartStr);
  const checkEnd = parse(checkEndStr);

  for (const slot of slots) {
    const [slotStartStr, slotEndStr] = slot.split("-");
    const slotStart = parse(slotStartStr);
    const slotEnd = parse(slotEndStr);

    if (checkStart >= slotStart && checkEnd <= slotEnd) {
      return true;
    }
  }

  return false;
}


export const addAppointment = async (req: Request, res: Response) => {
  try {
    const {
      hospitalId,
      title,
      doctorUsername,
      patientUsername,
      eventData,
      location,
      patientName,
      patientPhoneNumber,
      doctorName,
      type,
      time
    } = req.body;

    // Validate required fields
    if (!doctorUsername || !patientUsername || !eventData || !location) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }

    const doctorColl = await getCollection<IDoctor>("DoctorList", null);

    const doctor = await doctorColl.findOne(
      {
        doctorUsername: doctorUsername
      }
    )

    if (!doctor) {
      return res.status(400).json(
        {
          success: false,
          message: "doctor not found"
        }
      )
    }

    const day = getDayOfWeek(eventData.eventTime);

    if (!Object.values(EDay).includes(day as EDay)) {
      return res.status(400).json(
        {
          success: false,
          message: `Invalid eventTime`
        }
      )
    }

    const patientColl = await getCollection<IPatient>("PatientList", null);
    const existingPatient = await patientColl.findOne({ username: patientUsername });

    if (!existingPatient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found. Patient must be registered before creating an appointment."
      });
    }

    let newAppointment: IAppointment = {
      hospitalId,
      title: title,
      time: time,
      location: location,
      type: type || EventType.APPOINTMENT,
      patientUsername: patientUsername,
      patientName: patientName,
      patientPhoneNumber: patientPhoneNumber,
      doctorName: doctorName,
      doctorUsername: doctorUsername,
      eventData: {
        ...eventData,
        eventTime: eventData?.eventTime,
        eventTimeSlot: getSlotFromTime(eventData?.eventTime)
      },
      status: AppointmentStatus.PENDING,
    };

    const schedule: ITimeSlot | undefined = doctor.DutySchedule?.[day as EDay];

    const availableSlots = schedule?.slots
      .filter(s => s.eventType === EEventType.OPD && s.hospitalId === hospitalId.toString())
      .flatMap(s => s.slotTime) || [];


    if (!isSlotWithinSlots(availableSlots, newAppointment.eventData.eventTimeSlot)) {
      return res.status(404).json(
        {
          success: false,
          message: "Selected time slot is not available for this doctor. Please choose a different slot."
        }
      );
    }

    const hosScheduling = await getCollection<IAppointment>('Scheduling', hospitalId?.toString());

    const originalSlot = newAppointment.eventData.eventTimeSlot;

    try {
      newAppointment = await scheduleAppointment(newAppointment, hosScheduling, availableSlots);

    } catch (err: any) {
      return res.status(400).json({
        success: false,
        message: err.message || "Error during appointment scheduling.",
      });
    }
    // Save the appointment
    const result = await hosScheduling.insertOne(newAppointment);

    // Update patient's associations
    await patientColl.updateOne(
      { username: patientUsername },
      {
        $addToSet: {
          listOfDoctors: doctorUsername?.toString(),
          listOfHospitals: hospitalId?.toString()
        }
      }
    );

    return res.status(201).json({
      success: true,
      message: originalSlot != newAppointment.eventData.eventTimeSlot
        ? "Appointment created successfully in a different slot as the original slot was full."
        : "Appointment created successfully.",
      data: result,
      insertedData: newAppointment
    });
  }

  catch (error: any) {
    console.error("Error in scheduling appointment", error);
    return res.status(500).json({
      success: false,
      message: "Error in scheduling the appointment",
      error: error.message
    });
  }
}

export const completeAppointment = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongo = new ObjectId(id as string);
    const hosScheduling = await getCollection<IAppointment>('Scheduling', hospitalId?.toString());
    const appointments = await hosScheduling.findOneAndUpdate({ _id: mongo },
      { $set: { status: AppointmentStatus.COMPLETED } },
      { returnDocument: "after" }
    );
    if (!appointments) {
      return res.status(404).json({
        success: true,
        message: "Appointment not found."
      });
    }

    return res.status(201).json({
      success: true,
      message: "Appointment completed successfully.",
      data: appointments
    });



  } catch (error: any) {
    console.error("Error in updating appointment", error);
    return res.status(500).json({
      success: false,
      message: "Error in updating the appointment"
    });
  }
}

export const fetchPendingAppointments = async (req: Request, res: Response) => {
  try {
    let { hospitalId, date } = req.query; // date = "2023-10-01T00:00:00Z"
    const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
    const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
    const limit = upperLimit - lowerLimit; // Calculate the limit for the query

    if (limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid range: upperLimit must be greater than lowerLimit"
      });
    }
    const hosScheduling = await getCollection<IAppointment>('Scheduling', hospitalId?.toString());
    const todaysCurrentDate = (date as string)?.split('T')[0] || new Date().toISOString().split('T')[0];

    const appointments = await hosScheduling.aggregate([
      {
        $match: {
          status: "Pending",
          "eventData.eventDate": { $exists: true }
        }
      },
      {
        $addFields: {
          parsedDate: {
            $cond: [
              { $eq: [{ $type: "$eventData.eventDate" }, "string"] },
              { $toDate: "$eventData.eventDate" },
              "$eventData.eventDate"
            ]
          }
        }
      },
      {
        $addFields: {
          eventDateOnly: {
            $dateToString: { format: "%Y-%m-%d", date: "$parsedDate" }
          }
        }
      },
      {
        $match: {
          eventDateOnly: todaysCurrentDate // must be "YYYY-MM-DD"
        }
      },
      {
        $project: {
          "parsedDate": 0,
          "eventDateOnly": 0
        }
      }
    ]).toArray();


    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: true,
        message: "No appointments found."
      });
    }
    return res.status(200).json({
      success: true,
      message: "Appointments fetched successfully.",
      data: appointments
    });
  } catch (error: any) {
    console.error("Error in fetching the appointments", error);
    return res.status(500).json({
      message: "Error in fetching the appointments"
    });

  }
}

export const fetchOldAppointment = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.query;

    //Validate required hospitalId
    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required."
      })
    }
    const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
    const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
    const limit = upperLimit - lowerLimit; // Calculate the limit for the query

    if (limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid range: upperLimit must be greater than lowerLimit"
      });
    }
    const hosScheduling = await getCollection<IAppointment>('Scheduling', hospitalId?.toString());
    const currentDate = new Date(); // Use Date object for comparison
    currentDate.setHours(0, 0, 0, 0)
    console.log(currentDate)

    const appointments = await hosScheduling.aggregate([
      {
        $match: {
          status: "Pending",
          "eventData.eventDate": { $exists: true }
        }
      },
      {
        $addFields: {
          // Convert eventDate string to proper Date object
          parsedEventDate: {
            $toDate: "$eventData.eventDate"
          }
        }
      },
      {
        $match: {
          parsedEventDate: { $lt: currentDate }
        }
      },
      {
        $project: {
          "parsedEventDate": 0,
          "eventDateOnly": 0
        }
      }
    ]).toArray();

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: true,
        message: "No appointments found."
      });
    }
    return res.status(200).json({
      success: true,
      message: "Appointments fetched successfully.",
      data: appointments
    });
  } catch (error: any) {
    console.error("Error in fetching the appointments", error);
    return res.status(500).json({
      message: "Error in fetching the appointments"
    });

  }
}


export const fetchAppointments = async (req: Request, res: Response) => {
  try {
    const { hospitalId, doctorUsername, timeSlot, date } = req.query;
    /* 
    {
      "hospitalId":"hos_7BA7CF",
      "doctorId": "doc_441886",
      "timeSlot": "0800-1000",
      "date": "2022-09-01",
    }
    */
    //Validate required hospitalId
    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required."
      })
    }
    const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
    const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
    const limit = upperLimit - lowerLimit; // Calculate the limit for the query

    if (limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid range: upperLimit must be greater than lowerLimit"
      });
    }
    const hosScheduling = await getCollection<IAppointment>('Scheduling', hospitalId?.toString());
    const appointments = await hosScheduling.find({ doctorUsername, "eventData.eventTimeSlot": timeSlot, "eventData.eventDate": date }).skip(lowerLimit).limit(limit).toArray();

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: true,
        message: "No appointments found."
      });
    }
    return res.status(200).json({
      success: true,
      message: "Appointments fetched successfully.",
      data: appointments
    });
  } catch (error: any) {
    console.error("Error in fetching the appointments", error);
    return res.status(500).json({
      message: "Error in fetching the appointments"
    });
  }
}

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    //Validate required hospitalId
    if (!hospitalId || !id) {
      return res.status(400).json({
        success: false,
        message: "HospitalId and id are required."
      })
    }
    if (!isValidObjectId(id.toString())) {
      return res.status(400).json({
        success: true,
        message: "hospitalId and id are required fields"
      })
    }
    const mongo = new ObjectId(id as string);
    const hosScheduling = await getCollection<IAppointment>('Scheduling', hospitalId as string);
    const appointment = await hosScheduling.findOne({ _id: mongo });
    if (!appointment) {
      return res.status(404).json({
        success: true,
        message: "Appointment not found."
      });
    }

    const { title, location, time, isPayementConfirmed, status,
      patientName, doctorName, patientUsername, patientPhoneNumber, doctorUsername, eventData
    } = req.body;

    const updatedData: IAppointment = {
      title: title || appointment.title,
      location: location || appointment.location,
      time: time || appointment.time,
      status: status || appointment.status,
      patientName: patientName || appointment.patientName,
      doctorName: doctorName || appointment.doctorName,
      patientUsername: patientUsername || appointment.patientUsername,
      patientPhoneNumber: patientPhoneNumber || appointment.patientPhoneNumber,
      doctorUsername: doctorUsername || appointment.doctorUsername,
      hospitalId: appointment.hospitalId,
      type: appointment.type,
      eventData: {
        eventDate: eventData.eventDate || appointment.eventData.eventDate,
        eventTime: eventData.eventTime || appointment.eventData.eventTime,
        eventTimeSlot: eventData.eventTimeSlot || appointment.eventData.eventTimeSlot,
        problem: eventData.problem || appointment.eventData.problem,
        appointment_number: eventData.appointment_number || appointment.eventData.appointment_number,
        priority: eventData.priority || appointment.eventData.priority,
        medocCardUrl: eventData.medocCardUrl || appointment.eventData.medocCardUrl,
      },
      isPayementConfirmed: isPayementConfirmed !== undefined ? isPayementConfirmed : appointment.isPayementConfirmed,
    }

    console.log(updatedData)

    let newAppointment = updatedData;

    if (
      (doctorUsername?.trim() && doctorUsername !== appointment.doctorUsername) ||
      (
        eventData.eventTime.trim() && eventData.eventTime !== appointment.eventData.eventTime
      )
    ) {
      console.log("re-scheduling")
      // change schedule
      const doctorColl = await getCollection<IDoctor>("DoctorList", null);
      const doctor = await doctorColl.findOne({ doctorUsername: updatedData.doctorUsername })

      if (!doctor) {
        return res.status(404).json(
          {
            success: false,
            message: "doctor not found"
          }
        )
      }

      const day = getDayOfWeek(updatedData.eventData.eventTime);

      if (!Object.values(EDay).includes(day as EDay)) {
        return res.status(400).json(
          {
            success: false,
            message: `day must be in ${Object.values(EDay).join(",")}`
          }
        )
      }

      console.log(day)

      const timeSlot = getSlotFromTime(updatedData.eventData.eventTime);

      console.log(timeSlot)

      const schedule: ITimeSlot | undefined = doctor.DutySchedule?.[day as EDay];

      const availableSlots = schedule?.slots
        .filter(s => s.eventType === EEventType.OPD && s.hospitalId === hospitalId.toString())
        .flatMap(s => s.slotTime) || [];


      if (availableSlots.length == 0 || !isSlotWithinSlots(availableSlots, timeSlot)) {
        return res.status(404).json(
          {
            success: false,
            message: "Selected time slot is not available for this doctor. Please choose a different slot."
          }
        );
      }

      newAppointment.eventData.eventTimeSlot = timeSlot;

      try {
        newAppointment = await scheduleAppointment(updatedData, hosScheduling, availableSlots);

      } catch (err: any) {
        return res.status(400).json({
          success: false,
          message: err.message || "Error during appointment scheduling.",
        });
      }
    }




    await hosScheduling.updateOne({ _id: mongo }, { $set: newAppointment });
    return res.status(201).json({
      success: true,
      message: "Appointment updated successfully.",
      data: newAppointment
    });

  } catch (error: any) {
    console.error("Error in updating appointment", error);
    return res.status(500).json({
      success: false,
      message: "Error in updating the appointment"
    });
  }
}

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;

    // Validate required fields
    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required"
      });
    }
    const mongo = new ObjectId(id as string);
    const hosScheduling = await getCollection<IAppointment>('Scheduling', hospitalId?.toString());
    const appointments = await hosScheduling.findOneAndDelete({ _id: mongo });

    if (!appointments) {
      return res.status(404).json({
        success: true,
        message: "Appointment not found."
      });
    } else {
      return res.status(201).json({
        success: true,
        message: "Appointment deleted successfully.",
        data: appointments
      });
    }
  } catch (error: any) {
    console.error("Error in deleting appointment", error);
    return res.status(500).json({
      success: false,
      message: "Error in deleting the appointment"
    });
  }
}

export const fetchAllAppointment = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.query;
    // Validate required hospitalId
    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required"
      });
    }
    const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
    const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
    const limit = upperLimit - lowerLimit; // Calculate the limit for the query

    if (limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid range: upperLimit must be greater than lowerLimit"
      });
    }
    const hosScheduling = await getCollection<IAppointment>('Scheduling', hospitalId?.toString());
    const appointments: IAppointment[] = await hosScheduling.find().skip(lowerLimit).limit(limit).toArray();
    if (appointments.length == 0) {
      return res.status(404).json({
        success: true,
        message: "No appointments found."
      });
    }
    return res.status(200).json({
      success: true,
      message: "Appointments fetched successfully.",
      data: appointments
    });
  } catch (error: any) {
    console.error("Error in fetching all appointments", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching all the appointments"
    });
  }
}

export const fetchUpcomingAppointments = async (req: Request, res: Response) => {
  try {
    const {
      hospitalId,
      doctorUsername,
      date
    } = req.body;
    const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
    const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
    const limit = upperLimit - lowerLimit; // Calculate the limit for the query
    if (limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid range: upperLimit must be greater than lowerLimit"
      });
    }

    const hosScheduling = await getCollection<IAppointment>('Scheduling', hospitalId?.toString());
    // fetching all the appointments for the given doctorUsername and for upcoming dates excluding date
    const appointments = await hosScheduling.find({ doctorUsername, "eventData.date": { $gt: date } }).skip(lowerLimit).limit(limit).toArray();

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: true,
        message: "No appointments found."
      });
    }
    return res.status(200).json({
      success: true,
      message: "Appointments fetched successfully.",
      data: appointments
    });
  } catch (error: any) {
    console.error("Error in fetching all appointments", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching all the appointments"
    });
  }
}

export const fetchAllUpcomingAppointments = async (req: Request, res: Response) => {
  try {
    const { hospitalId, date } = req.query;

    // Validate required hospitalId
    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required."
      });
    }

    // Parse pagination parameters
    const lowerLimit = parseInt(req.query.lowerLimit as string) || 0;
    const upperLimit = parseInt(req.query.upperLimit as string) || 1000;
    const limit = upperLimit - lowerLimit;

    if (limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid range: upperLimit must be greater than lowerLimit"
      });
    }

    // Get the collection
    const hosScheduling = await getCollection<IAppointment>('Scheduling', hospitalId?.toString());

    // Use provided date or current date
    const currentDate = date ? new Date(date as string) : new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Create tomorrow date to exclude today's appointments
    const tomorrowDate = new Date(currentDate);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    console.log("Current date:", currentDate);
    console.log("Tomorrow date:", tomorrowDate);

    // Fetching all upcoming appointments starting from tomorrow
    const appointments = await hosScheduling.aggregate([
      {
        $match: {
          status: "Pending",
          "eventData.eventDate": { $exists: true }
        }
      },
      {
        $addFields: {
          // Convert eventDate string to proper Date object
          parsedEventDate: {
            $toDate: "$eventData.eventDate"
          }
        }
      },
      {
        $match: {
          parsedEventDate: { $gte: tomorrowDate } // Use $gte with tomorrow's date to exclude today
        }
      },
      {
        $sort: {
          "parsedEventDate": 1 // Sort by date ascending (closest upcoming appointments first)
        }
      },
      {
        $skip: lowerLimit
      },
      {
        $limit: limit
      },
      {
        $project: {
          "parsedEventDate": 0 // Remove the temporary field
        }
      }
    ]).toArray();

    if (!appointments || appointments.length === 0) {
      return res.status(200).json({  // Changed from 404 to 200 for empty results
        success: true,
        message: "No upcoming appointments found.",
        data: []
      });
    }

    return res.status(200).json({
      success: true,
      message: "Upcoming appointments fetched successfully.",
      data: appointments,
      count: appointments.length,
      lowerLimit,
      upperLimit
    });
  } catch (error: any) {
    console.error("Error in fetching upcoming appointments:", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching upcoming appointments",
      error: error.message
    });
  }
}

export const addScan = async (req: Request, res: Response) => {
  try {
    const {
      hospitalId,
      patientUsername,
      patientName,
      patientPhoneNumber,
      date,
      hospitalName,
      type,
      prescipDoctor,
      doctorUsername,
      performingDoc,
      note,
      contents,
      filePath,
      uploaded_At,
      uploaded_by,
      downloaded_at,
      downloaded_by,
      createdAt,
      updatedAt,
      DOB,
      department,
      isLab,
      ScanResult
    } = req.body;
    console.log(req.body)
    const scansColl = await getCollection<ILabScan>("LabScan", hospitalId?.toString());
    if (!hospitalId || !patientUsername) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }
    const newScan: ILabScan = {
      hospitalId,
      patientUsername: patientUsername,
      patientName,
      patientPhoneNumber,
      date: date,
      hospitalName,
      type,
      prescipDoctor,
      doctorUsername,
      performingDoc,
      note,
      contents: contents || [],
      filePath,
      uploaded_by,
      uploaded_At,
      downloaded_by,
      downloaded_at,
      createdAt,
      updatedAt,
      DOB,
      department,
      isLab,
      ScanResult: ScanResult || []
    };
    const insertResult = await scansColl.insertOne(newScan);
    return res.status(201).json({
      success: true,
      message: "Scan created successfully.",
      data: insertResult
    });
  } catch (error: any) {
    console.error("Error in creating scan", error);
    return res.status(500).json({
      success: false,
      message: "Error in creating the scan"
    });
  }
}

export const getAllScans = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.query;
    const scansColl = await getCollection<ILabScan>("LabScan", hospitalId?.toString());
    const scans = await scansColl.find({}).toArray();
    if (!scans) {
      return res.status(404).json({
        success: true,
        message: "No scans found."
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Scans fetched successfully.",
        data: scans
      });
    }
  } catch (error: any) {
    console.error("Error in getting items", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching the scans"
    });
  }
}

export const deleteScans = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongo = new ObjectId(id as string);
    const scansColl = await getCollection<ILabScan>("LabScan", hospitalId?.toString());
    const scans = await scansColl.findOneAndDelete({ _id: mongo });

    if (!scans) {
      return res.status(404).json({
        success: true,
        message: "Scan not found."
      });
    } else {
      return res.status(201).json({
        success: true,
        message: "Scan deleted successfully.",
        data: scans
      });
    }
  } catch (error: any) {
    console.error("Error in deleting scan", error);
    return res.status(500).json({
      success: false,
      message: "Error in deleting the scan"
    });
  }
}

export const updateScan = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongo = new ObjectId(id as string);
    const scansColl = await getCollection<ILabScan>("LabScan", hospitalId?.toString());
    const data = req.body;

    if (Object.keys(data).length == 0) {
      return res.status(400).json({
        "success": true,
        "message": "All fields are required for update!"
      })
    }

    const scans = await scansColl.findOneAndUpdate({ _id: mongo }, { $set: data }, { returnDocument: "after" });
    if (!scans) {
      return res.status(404).json({
        success: true,
        message: "Scan not found."
      });
    } else {
      return res.status(201).json({
        success: true,
        message: "Scan updated successfully.",
        data: scans
      });
    }
  } catch (error: any) {
    console.error("Error in updating scan", error);
    return res.status(500).json({
      success: false,
      message: "Error in updating the scan"
    });
  }
}

export const addScanDone = async (req: Request, res: Response) => {
  try {
    const { hospitalId, id } = req.query;
    const mongo = new ObjectId(id as string);
    const scanColl = await getCollection<ILabScan>("LabScan", hospitalId?.toString());
    const ScanDone = req.body;
    const scan = await scanColl.findOneAndUpdate({ _id: mongo }, { $set: { ScanDone: ScanDone } }, { returnDocument: "after" });
    if (!scan) {
      return res.status(404).json({
        success: true,
        message: "Scan not found."
      });
    }
    return res.status(201).json({
      success: true,
      message: "Report added successfully.",
      data: scan
    });
  } catch (error: any) {
    console.error("Error in adding report", error);
    return res.status(500).json({
      success: false,
      message: "Error in adding the report"
    });
  }
}

export const getNotification = async (req: Request, res: Response) => {
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

    const notColl = await getCollection<NotifyLabScan>("NotifyLabScan", hospitalId?.toString());

    const userNotifications = await notColl.find({ notification: notify.unread }).skip(lowerLimit).limit(limit).toArray();
    if (userNotifications.length === 0) {
      return res.status(404).json({ message: "No notifications found" });
    }

    return res.status(200).json({
      message: "Notifications retrieved successfully",
      userNotifications,
    });
  } catch (error: any) {
    console.error("Error in getting notification", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching the notification"
    });
  }
}

export const notificationRead = async (req: Request, res: Response) => {
  try {
    const { hospitalId, patientUsername } = req.query;


    const notColl = await getCollection<NotifyLabScan>("NotifyLabScan", hospitalId?.toString());

    const userNotification = await notColl.find({ patientUsername }).toArray();

    if (userNotification.length === 0) {
      return res.status(404).json({ message: "No notifications found" });
    }

    await notColl.updateOne(
      { patientUsername, notification: notify.unread },
      { $set: { notification: notify.read } }
    );


    res.status(200).json({
      message: "Notifications retrieved successfully and marked as read",
      userNotification,
    });
  } catch (error: any) {
    console.error("Error in getting notification", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching the notification"
    });
  }
}

// 1. kitne count ke baad discount dena ha
// 2. kitna discount dena ha
// opd ke valid interval me let 1 week ha to next opd free hogi


export const countAppointmentPerPatient = async (req: Request, res: Response) => {
  try {
    const { hospitalId, patientUsername } = req.query;
    const hosScheduling = await getCollection<IAppointment>('Scheduling', hospitalId?.toString());
    const appointments = await hosScheduling.find({ patientUsername: patientUsername as string }).toArray();
    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: true,
        message: "No appointments found."
      });
    }
    return res.status(200).json({
      success: true,
      message: "Appointments fetched successfully.",
      data: appointments.length
    });
  } catch (error: any) {
    console.error("Error in getting notification", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching the notification"
    });
  }
}


export const isNewOpdInBetweenTheFreeInterval = async (req: Request, res: Response) => {
  try {
    const { hospitalId, patientUsername, date } = req.query;
    const collections = await Promise.all([
      getCollection<IAppointment>('Scheduling', hospitalId as string),
      getCollection<IHospital>('Hospitals', null)
    ])
    const hospital = await collections[1].findOne({ hospitalId: hospitalId });
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found"
      });
    }
    const validVisitInterval = hospital?.discount.opdDiscount.freeOpdInterval;
    const hosScheduling = collections[0];
    const appointments = await hosScheduling.find({ patientUsername: patientUsername as string }).toArray();
    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: true,
        message: "No appointments found."
      });
    } const eventDate = new Date(date as string);
    // Sort appointments by date (oldest to newest)
    appointments.sort((a, b) =>
      new Date(a.eventData.eventDate).getTime() -
      new Date(b.eventData.eventDate).getTime()
    );
    const lastAppointmentDate = new Date(appointments[appointments.length - 1].eventData.eventDate);

    // Calculate time difference in days
    const timeDifferenceInDays = Math.floor((eventDate.getTime() - lastAppointmentDate.getTime()) / (24 * 60 * 60 * 1000));

    if (timeDifferenceInDays > validVisitInterval) {
      return res.status(200).json({
        success: true,
        message: "New OPD is not in between the free interval",
        data: false
      });
    }
    return res.status(200).json({
      success: true,
      message: "New OPD is in between the free interval",
      data: true
    });
  } catch (error: any) {
    console.error("Error in getting notification", error);
    return res.status(500).json({
      success: false,
      message: "Error in fetching the notification"
    });
  }
}


/*
export const updateAllAppointmentAccordingToNewModel = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.query;
    
    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "hospitalId is required"
      });
    }
    
    const hosScheduling = await getCollection('Scheduling', hospitalId.toString());
    const appointments = await hosScheduling.find({}).toArray();
    
    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: true,
        message: "No appointments found."
      });
    }
    
    const bulkOps = [];
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const appointment of appointments) {
      // Create a new object for the updated appointment
      const updatedAppointment: any = {
        _id: appointment._id,
        hospitalId: appointment.hospitalId || hospitalId.toString(),
        title: appointment.title || '',
        time: appointment.time || new Date().toISOString(),
        location: appointment.location || '',
        type: appointment.type || EventType.APPOINTMENT,
        status: appointment.status || AppointmentStatus.PENDING,
        patientUsername: appointment.patientUsername || '',
        patientName: appointment.patientName || '',
        patientPhoneNumber: appointment.patientPhoneNumber || '',
        doctorUsername: appointment.doctorUsername || '',
        doctorName: appointment.doctorName || '',
        isPayementConfirmed: appointment.isPayementConfirmed || false
      };
      
      // Create a new eventData object according to the new model
      if (appointment.eventData) {
        const oldEventData = appointment.eventData;
        
        updatedAppointment.eventData = {
          // Map fields from old model to new model
          eventDate: oldEventData.date || oldEventData.eventDate || new Date().toISOString(),
          eventTime: oldEventData.time || oldEventData.eventTime || new Date().toISOString(),
          eventTimeSlot: oldEventData.timeSlot || oldEventData.eventTimeSlot || '',
          problem: oldEventData.problem || '',
          appointment_number: oldEventData.appointment_number || 0,
          priority: oldEventData.priority || 0,
          medocCardUrl: oldEventData.medocCardUrl || ''
        };
      } else {
        // Create default eventData if missing
        updatedAppointment.eventData = {
          eventDate: new Date().toISOString(),
          eventTime: new Date().toISOString(),
          eventTimeSlot: '',
          problem: '',
          appointment_number: 0,
          priority: 0,
          medocCardUrl: ''
        };
      }
      
      // Preserve any other fields that might be in the document
      // but aren't part of our explicit mapping
      Object.keys(appointment).forEach(key => {
        if (!updatedAppointment.hasOwnProperty(key) && key !== 'eventData') {
          updatedAppointment[key] = appointment[key];
        }
      });
      
      // Add to bulk operations
      bulkOps.push({
        updateOne: {
          filter: { _id: appointment._id },
          update: { $set: updatedAppointment },
          upsert: false
        }
      });
      
      updatedCount++;
    }
    
    // Execute bulk operations if there are any
    if (bulkOps.length > 0) {
      const bulkResult = await hosScheduling.bulkWrite(bulkOps);
      
      return res.status(200).json({
        success: true,
        message: "Appointments updated successfully",
        data: {
          totalAppointments: appointments.length,
          updatedCount,
          skippedCount,
          bulkWriteResult: {
            matchedCount: bulkResult.matchedCount,
            modifiedCount: bulkResult.modifiedCount
          }
        }
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "No appointments needed updates",
        data: {
          totalAppointments: appointments.length,
          updatedCount: 0,
          skippedCount: appointments.length
        }
      });
    }
  } catch (error: any) {
    console.error("Error in updating appointments", error);
    return res.status(500).json({
      success: false,
      message: "Error in updating the appointments",
      error: error.message
    });
  }
};

*/