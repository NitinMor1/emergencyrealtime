import { Request, Response } from "express";
import { getCollection } from "../../db/db";
import { IEmergency, EStatus } from "./emergencyModel";
import { IHospital } from "../auth/HospitalModel";
import { IEmployee, IADMIN } from "../resource/HRMS/hrModel";
import { v4 as uuidv4 } from "uuid";
import { param } from "express-validator";

// Helper function to generate room id
export const generateEmergencyRoomId = (hospitalId: string): string => {
  return `ER-${hospitalId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

// Helper function to find available paramedic
const findAvailableParamedic = async (hospitalId: string): Promise<IEmployee | null> => {
  const employeeCol = await getCollection<IEmployee>("Employee", hospitalId);

  const availableParamedic = await employeeCol.findOne({
    hospitalId: hospitalId,
    "HR.role.role": IADMIN.Paramedic,
    "HR.availabilityStatus": "Available"
  });

  return availableParamedic;
};

// Helper function to find available driver
const findAvailableDriver = async (hospitalId: string): Promise<IEmployee | null> => {
  const employeeCol = await getCollection<IEmployee>("Employee", hospitalId);

  const availableDriver = await employeeCol.findOne({
    hospitalId: hospitalId,
    "HR.role.role": IADMIN.DRIVER,
    "HR.availabilityStatus": "Available"
  });

  return availableDriver;
};

// Helper function to find available ambulance
const findAvailableAmbulance = async (hospitalId: string): Promise<string | null> => {
  const hospitalCol = await getCollection<IHospital>("Hospitals", null);
  const emergencyCol = await getCollection<IEmergency>("Emergency", hospitalId);

  const hospital = await hospitalCol.findOne({ hospitalId: hospitalId });
  if (!hospital || !hospital.ambulance || hospital.ambulance.length === 0) {
    return null;
  }

  // Get all currently assigned ambulances
  const assignedAmbulances = await emergencyCol.find({
    status: { $in: [EStatus.CREATED] },
    ambulanceNumber: { $exists: true, $ne: "" }
  }).toArray();

  const assignedNumbers = assignedAmbulances.map(e => e.ambulanceNumber);

  // Find first available ambulance
  const availableAmbulance = hospital.ambulance.find(amb =>
    !assignedNumbers.includes(amb)
  );

  return availableAmbulance ? availableAmbulance : null;
};

// Helper function to update employee availability status
const updateEmployeeAvailability = async (
  hospitalId: string,
  username: string,
  status: 'Available' | 'Occupied' | 'On Leave'
) => {
  const employeeCol = await getCollection<IEmployee>("Employee", hospitalId);
  await employeeCol.updateOne(
    { "ContactDetails.username": username },
    { $set: { "HR.availabilityStatus": status } }
  );
};

export const createPartialEmergency = async (req: Request, res: Response) => {
  try {
    const {
      hospitalId,
      emergencyId,
      emergencyType,
      emergencyDescription,
      emergencyLocation,
      emergencyTime,
      patient,
      creatorId
    } = req.body;

    // Validate required fields
    if (!hospitalId || !emergencyType || !emergencyLocation || !emergencyTime || !patient) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: hospitalId, emergencyType, emergencyLocation, emergencyTime, patient"
      });
    }

    // Validate patient information
    if (!patient.name || !patient.phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Patient name and phone number are required"
      });
    }

    // Find available resources
    const availableParamedic = await findAvailableParamedic(hospitalId);
    const availableDriver = await findAvailableDriver(hospitalId);
    const availableAmbulance = await findAvailableAmbulance(hospitalId);

    if (!availableParamedic || !availableParamedic.ContactDetails.username) {
      return res.status(400).json({
        success: false,
        message: "No paramedic available at the moment"
      });
    }

    if (!availableDriver || !availableDriver.ContactDetails.username) {
      return res.status(400).json({
        success: false,
        message: "No driver available at the moment"
      });
    }

    if (!availableAmbulance) {
      return res.status(400).json({
        success: false,
        message: "No ambulance available at the moment"
      });
    }

    const emergencyCol = await getCollection<IEmergency>("Emergency", hospitalId);

    const emergency: IEmergency = {
      hospitalId,
      emergencyId,
      emergencyRoomId: generateEmergencyRoomId(hospitalId),
      emergencyType,
      emergencyDescription,
      emergencyLocation,
      emergencyTime,
      patient,
      status: EStatus.CREATED,
      completedTime: "",
      creatorId,
      paramedicId: availableParamedic.ContactDetails.username?.toString(),
      driverId: availableDriver.ContactDetails.username?.toString(),
      ambulanceNumber: availableAmbulance
    };

    await emergencyCol.insertOne(emergency);

    // Update employee availability to 'Occupied'
    if (!availableParamedic.ContactDetails.username) {
      return res.status(400).json({
        success: false,
        message: "Paramedic username is missing"
      });
    }
    await updateEmployeeAvailability(hospitalId, availableParamedic.ContactDetails.username.toString(), 'Occupied');
    await updateEmployeeAvailability(hospitalId, availableDriver.ContactDetails.username.toString(), 'Occupied');

    return res.status(201).json({
      success: true,
      message: "Emergency created successfully with auto-assigned resources",
      data: {
        emergency,
        assignedResources: {
          paramedic: {
            username: availableParamedic.ContactDetails.username,
            name: availableParamedic.ContactDetails.name,
            employeeId: availableParamedic.ContactDetails.employeeId
          },
          driver: {
            username: availableDriver.ContactDetails.username,
            name: availableDriver.ContactDetails.name,
            employeeId: availableDriver.ContactDetails.employeeId
          },
          ambulance: availableAmbulance
        }
      }
    });
  } catch (error) {
    console.error("Error creating partial emergency:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const updateEmergencyAssignees = async (req: Request, res: Response) => {
  try {
    const { hospitalId, emergencyId } = req.query;
    const { paramedicId, driverId, ambulanceNumber } = req.body;

    if (!hospitalId || !emergencyId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID and Emergency ID are required"
      });
    }

    const emergencyCol = await getCollection<IEmergency>("Emergency", hospitalId.toString());
    const currentEmergency = await emergencyCol.findOne({ emergencyId: emergencyId.toString() });

    if (!currentEmergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found"
      });
    }

    if (currentEmergency.status !== EStatus.CREATED) {
      return res.status(400).json({
        success: false,
        message: "Cannot update assignees for emergency with status: " + currentEmergency.status
      });
    }

    const updateData: Partial<IEmergency> = {};

    // Handle paramedic change
    if (paramedicId && paramedicId !== currentEmergency.paramedicId) {
      // Check if new paramedic is available
      const employeeCol = await getCollection<IEmployee>("Employee", hospitalId.toString());
      const newParamedic = await employeeCol.findOne({
        "ContactDetails.username": paramedicId,
        "HR.role.role": IADMIN.Paramedic,
        "HR.availabilityStatus": "Available"
      });

      if (!newParamedic) {
        return res.status(400).json({
          success: false,
          message: "Selected paramedic is not available"
        });
      }

      // Free up old paramedic
      if (currentEmergency.paramedicId) {
        await updateEmployeeAvailability(hospitalId.toString(), currentEmergency.paramedicId, 'Available');
      }

      // Assign new paramedic
      await updateEmployeeAvailability(hospitalId.toString(), paramedicId, 'Occupied');
      updateData.paramedicId = paramedicId;
    }

    // Handle driver change
    if (driverId && driverId !== currentEmergency.driverId) {
      // Check if new driver is available
      const employeeCol = await getCollection<IEmployee>("Employee", hospitalId.toString());
      const newDriver = await employeeCol.findOne({
        "ContactDetails.username": driverId,
        "HR.role.role": IADMIN.DRIVER,
        "HR.availabilityStatus": "Available"
      });

      if (!newDriver) {
        return res.status(400).json({
          success: false,
          message: "Selected driver is not available"
        });
      }

      // Free up old driver
      if (currentEmergency.driverId) {
        await updateEmployeeAvailability(hospitalId.toString(), currentEmergency.driverId, 'Available');
      }

      // Assign new driver
      await updateEmployeeAvailability(hospitalId.toString(), driverId, 'Occupied');
      updateData.driverId = driverId;
    }

    // Handle ambulance change
    if (ambulanceNumber && ambulanceNumber !== currentEmergency.ambulanceNumber) {
      // Check if new ambulance is available
      const availableAmbulance = await findAvailableAmbulance(hospitalId.toString());
      const hospitalCol = await getCollection<IHospital>("Hospitals", null);
      const hospital = await hospitalCol.findOne({ hospitalId: hospitalId.toString() });

      const ambulanceExists = hospital?.ambulance?.some(amb => amb === ambulanceNumber);

      if (!ambulanceExists) {
        return res.status(400).json({
          success: false,
          message: "Selected ambulance does not exist"
        });
      }

      // Check if ambulance is currently assigned to another emergency
      const ambulanceInUse = await emergencyCol.findOne({
        ambulanceNumber: ambulanceNumber,
        status: EStatus.CREATED,
        emergencyId: { $ne: emergencyId.toString() }
      });

      if (ambulanceInUse) {
        return res.status(400).json({
          success: false,
          message: "Selected ambulance is currently assigned to another emergency"
        });
      }

      updateData.ambulanceNumber = ambulanceNumber;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid updates provided"
      });
    }

    const result = await emergencyCol.updateOne(
      { emergencyId: emergencyId.toString() },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Emergency assignees updated successfully",
      data: updateData
    });
  } catch (error) {
    console.error("Error updating emergency assignees:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getEmergency = async (req: Request, res: Response) => {
  try {
    const { hospitalId, emergencyId } = req.query;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required"
      });
    }

    const emergencyColl = await getCollection<IEmergency>("Emergency", hospitalId.toString());

    if (emergencyId) {
      const emergency = await emergencyColl.findOne({ emergencyId: emergencyId.toString() });
      if (!emergency) {
        return res.status(404).json({
          success: false,
          message: "Emergency not found"
        });
      }


      const employeeCol = await getCollection<IEmployee>("Employee", hospitalId.toString());

      const [paramedic, driver] = await Promise.all([
        emergency.paramedicId
          ? employeeCol.findOne({ "ContactDetails.username": emergency.paramedicId })
          : null,
        emergency.driverId
          ? employeeCol.findOne({ "ContactDetails.username": emergency.driverId })
          : null
      ]);

      const paramedicDetails = paramedic
        ? {
          username: paramedic.ContactDetails.username,
          name: paramedic.ContactDetails.name,
          employeeId: paramedic.ContactDetails.employeeId,
          phoneNumber: paramedic.ContactDetails.phoneNumber
        }
        : null;

      const driverDetails = driver
        ? {
          username: driver.ContactDetails.username,
          name: driver.ContactDetails.name,
          employeeId: driver.ContactDetails.employeeId,
          phoneNumber: driver.ContactDetails.phoneNumber
        }
        : null;
      return res.status(200).json({
        success: true,
        data: {
          ...emergency,
          paramedic: paramedicDetails,
          driver: driverDetails,

        }
      });
    }
    const emergencies = await emergencyColl.find({}).toArray();

    const employeeCol = await getCollection<IEmployee>("Employee", hospitalId.toString());
    const emergenciesWithDetails = await Promise.all(
      emergencies.map(async (emergency) => {
        const [paramedic, driver] = await Promise.all([
          emergency.paramedicId
            ? employeeCol.findOne({ "ContactDetails.username": emergency.paramedicId })
            : null,
          emergency.driverId
            ? employeeCol.findOne({ "ContactDetails.username": emergency.driverId })
            : null
        ]);

        const paramedicDetails = paramedic
          ? {
            username: paramedic.ContactDetails.username,
            name: paramedic.ContactDetails.name,
            employeeId: paramedic.ContactDetails.employeeId,
            phoneNumber: paramedic.ContactDetails.phoneNumber
          }
          : null;

        const driverDetails = driver
          ? {
            username: driver.ContactDetails.username,
            name: driver.ContactDetails.name,
            employeeId: driver.ContactDetails.employeeId,
            phoneNumber: driver.ContactDetails.phoneNumber
          }
          : null;

        return {
          ...emergency,
          paramedic: paramedicDetails,
          driver: driverDetails
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: emergenciesWithDetails
    });

    // return res.status(200).json({
    //   success: true,
    //   data: emergencies
    // });

  } catch (error) {
    console.error("Error fetching emergency:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getEmergencyById = async (req: Request, res: Response) => {
  try {
    const { hospitalId, emergencyId } = req.query;

    if (!hospitalId || !emergencyId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required"
      });
    }

    const emergencyColl = await getCollection<IEmergency>("Emergency", hospitalId.toString());

    const emergency = await emergencyColl.findOne({ emergencyId: emergencyId.toString() });
    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found"
      });
    }


    const employeeCol = await getCollection<IEmployee>("Employee", hospitalId.toString());

    const [paramedic, driver] = await Promise.all([
      emergency.paramedicId
        ? employeeCol.findOne({ "ContactDetails.username": emergency.paramedicId })
        : null,
      emergency.driverId
        ? employeeCol.findOne({ "ContactDetails.username": emergency.driverId })
        : null
    ]);

    const paramedicDetails = paramedic
      ? {
        username: paramedic.ContactDetails.username,
        name: paramedic.ContactDetails.name,
        employeeId: paramedic.ContactDetails.employeeId,
        phoneNumber: paramedic.ContactDetails.phoneNumber
      }
      : null;

    const driverDetails = driver
      ? {
        username: driver.ContactDetails.username,
        name: driver.ContactDetails.name,
        employeeId: driver.ContactDetails.employeeId,
        phoneNumber: driver.ContactDetails.phoneNumber
      }
      : null;

    return res.status(200).json({
      success: true,
      data: {
        ...emergency,
        paramedic: paramedicDetails,
        driver: driverDetails,
        ambulance: emergency.ambulanceNumber

      }
    });
  } catch (error) {
    console.error("Error fetching emergency:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

export const getAssignedEmergency = async (req: Request, res: Response) => {
  try {
    const { hospitalId, username, emergencyId } = req.query;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required"
      });
    }

    const emergencyColl = await getCollection<IEmergency>("Emergency", hospitalId.toString());

    const query: { $or: Array<Record<string, any>> } = { $or: [] };

    if (emergencyId) query.$or.push({ emergencyId: emergencyId.toString() })

    if (username) query.$or.push({ username, status: EStatus.CREATED });

    const emergency = await emergencyColl.findOne(query);

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "No assigned Emergency found"
      });
    }

    const employeeCol = await getCollection<IEmployee>("Employee", hospitalId.toString());

    const driver = await employeeCol.findOne({ "ContactDetails.username": emergency.driverId });

    const driverDetails = driver
      ? {
        username: driver.ContactDetails.username,
        name: driver.ContactDetails.name,
        employeeId: driver.ContactDetails.employeeId,
        phoneNumber: driver.ContactDetails.phoneNumber
      }
      : null;

    return res.status(200).json({
      success: true,
      data: {
        ...emergency,
        driver: driverDetails,
        ambulance: emergency.ambulanceNumber

      }
    });
  } catch (error) {
    console.error("Error fetching emergency:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

export const updateEmergencyStatus = async (req: Request, res: Response) => {
  try {
    const { hospitalId, emergencyId } = req.query;
    const { status, rejectionReason } = req.body;

    if (!hospitalId || !emergencyId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID and Emergency ID are required"
      });
    }

    if (!status || !Object.values(EStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required"
      });
    }

    const emergencyCol = await getCollection<IEmergency>("Emergency", hospitalId.toString());
    const currentEmergency = await emergencyCol.findOne({ emergencyId: emergencyId.toString() });

    if (!currentEmergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found"
      });
    }

    const updateData: Partial<IEmergency> = { status };

    // Handle status-specific updates
    if (status === EStatus.COMPLETED) {
      updateData.completedTime = new Date().toISOString();
    }

    if (status === EStatus.REJECTED && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    // Free up resources if emergency is completed, cancelled, or rejected
    if ([EStatus.COMPLETED, EStatus.CANCELLED, EStatus.REJECTED].includes(status)) {
      if (currentEmergency.paramedicId) {
        await updateEmployeeAvailability(hospitalId.toString(), currentEmergency.paramedicId, 'Available');
      }
      if (currentEmergency.driverId) {
        await updateEmployeeAvailability(hospitalId.toString(), currentEmergency.driverId, 'Available');
      }
    }

    const result = await emergencyCol.updateOne(
      { emergencyId: emergencyId.toString() },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Emergency status updated successfully"
    });
  } catch (error) {
    console.error("Error updating emergency status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const deleteEmergency = async (req: Request, res: Response) => {
  try {
    const { hospitalId, emergencyId } = req.query;

    if (!hospitalId || !emergencyId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID and Emergency ID are required"
      });
    }

    const emergencyCol = await getCollection<IEmergency>("Emergency", hospitalId.toString());
    const emergency = await emergencyCol.findOne({ emergencyId: emergencyId.toString() });

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found"
      });
    }

    // Free up assigned resources before deletion
    if (emergency.paramedicId) {
      await updateEmployeeAvailability(hospitalId.toString(), emergency.paramedicId, 'Available');
    }
    if (emergency.driverId) {
      await updateEmployeeAvailability(hospitalId.toString(), emergency.driverId, 'Available');
    }

    const result = await emergencyCol.deleteOne({ emergencyId: emergencyId.toString() });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Emergency not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Emergency deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting emergency:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const createEmergency = async (req: Request, res: Response) => {
  try {
    const {
      hospitalId,
      emergencyId,
      emergencyType,
      emergencyDescription,
      emergencyLocation,
      emergencyTime,
      patient,
      creatorId,
      paramedicId,
      driverId,
      ambulanceNumber
    } = req.body;

    // Validate required fields
    if (!hospitalId || !emergencyType || !emergencyLocation || !emergencyTime || !patient) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: hospitalId, emergencyType, emergencyLocation, emergencyTime, patient"
      });
    }

    // Validate patient information
    if (!patient.name || !patient.phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Patient name and phone number are required"
      });
    }

    const emergencyCol = await getCollection<IEmergency>("Emergency", hospitalId);
    const employeeCol = await getCollection<IEmployee>("Employee", hospitalId);

    // If specific assignments are provided, validate them
    if (paramedicId) {
      const paramedic = await employeeCol.findOne({
        "ContactDetails.username": paramedicId,
        hospitalId: hospitalId,
        "HR.role.role": IADMIN.Paramedic
      });

      if (!paramedic) {
        return res.status(400).json({
          success: false,
          message: "Invalid paramedic ID or paramedic not found"
        });
      }

      if (paramedic.HR.availabilityStatus !== 'Available') {
        return res.status(400).json({
          success: false,
          message: `Selected paramedic is not available. Current status: ${paramedic.HR.availabilityStatus}`
        });
      }

      // Check if paramedic is already assigned to another active emergency
      const existingAssignment = await emergencyCol.findOne({
        paramedicId: paramedicId,
        status: EStatus.CREATED
      });

      if (existingAssignment) {
        return res.status(400).json({
          success: false,
          message: "Selected paramedic is already assigned to another active emergency"
        });
      }
    }

    if (driverId) {
      const driver = await employeeCol.findOne({
        "ContactDetails.username": driverId,
        hospitalId: hospitalId,
        "HR.role.role": IADMIN.DRIVER
      });

      if (!driver) {
        return res.status(400).json({
          success: false,
          message: "Invalid driver ID or driver not found"
        });
      }

      if (driver.HR.availabilityStatus !== 'Available') {
        return res.status(400).json({
          success: false,
          message: `Selected driver is not available. Current status: ${driver.HR.availabilityStatus}`
        });
      }

      // Check if driver is already assigned to another active emergency
      const existingAssignment = await emergencyCol.findOne({
        driverId: driverId,
        status: EStatus.CREATED
      });

      if (existingAssignment) {
        return res.status(400).json({
          success: false,
          message: "Selected driver is already assigned to another active emergency"
        });
      }
    }

    if (ambulanceNumber) {
      // Validate ambulance exists in hospital
      const hospitalCol = await getCollection<IHospital>("Hospitals", null);
      const hospital = await hospitalCol.findOne({ hospitalId: hospitalId });

      if (!hospital || !hospital.ambulance) {
        return res.status(400).json({
          success: false,
          message: "No ambulances found for this hospital"
        });
      }

      const ambulanceExists = hospital.ambulance.some(amb => amb === ambulanceNumber);
      if (!ambulanceExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid ambulance number"
        });
      }

      // Check if ambulance is already assigned to another active emergency
      const existingAssignment = await emergencyCol.findOne({
        ambulanceNumber: ambulanceNumber,
        status: EStatus.CREATED
      });

      if (existingAssignment) {
        return res.status(400).json({
          success: false,
          message: "Selected ambulance is already assigned to another active emergency"
        });
      }
    }

    // If no specific assignments provided, auto-assign available resources
    let finalParamedicId = paramedicId;
    let finalDriverId = driverId;
    let finalAmbulanceNumber = ambulanceNumber;

    if (!finalParamedicId) {
      const availableParamedic = await findAvailableParamedic(hospitalId);
      if (!availableParamedic || !availableParamedic.ContactDetails.username) {
        return res.status(400).json({
          success: false,
          message: "No paramedic available. Please specify a paramedic or try again later."
        });
      }
      finalParamedicId = availableParamedic.ContactDetails.username.toString();
    }

    if (!finalDriverId) {
      const availableDriver = await findAvailableDriver(hospitalId);
      if (!availableDriver || !availableDriver.ContactDetails.username) {
        return res.status(400).json({
          success: false,
          message: "No driver available. Please specify a driver or try again later."
        });
      }
      finalDriverId = availableDriver.ContactDetails.username.toString();
    }

    if (!finalAmbulanceNumber) {
      const availableAmbulance = await findAvailableAmbulance(hospitalId);
      if (!availableAmbulance) {
        return res.status(400).json({
          success: false,
          message: "No ambulance available. Please specify an ambulance or try again later."
        });
      }
      finalAmbulanceNumber = availableAmbulance;
    }

    const emergency: IEmergency = {
      hospitalId,
      emergencyId,
      emergencyRoomId: generateEmergencyRoomId(hospitalId),
      emergencyType,
      emergencyDescription,
      emergencyLocation,
      emergencyTime,
      patient,
      status: EStatus.CREATED,
      completedTime: "",
      creatorId,
      paramedicId: finalParamedicId,
      driverId: finalDriverId,
      ambulanceNumber: finalAmbulanceNumber
    };

    await emergencyCol.insertOne(emergency);

    // Update employee availability to 'Occupied'
    if (finalParamedicId) {
      await updateEmployeeAvailability(hospitalId, finalParamedicId, 'Occupied');
    }
    if (finalDriverId) {
      await updateEmployeeAvailability(hospitalId, finalDriverId, 'Occupied');
    }

    // Get assigned resource details for response
    const assignedParamedic = finalParamedicId ? await employeeCol.findOne({
      "ContactDetails.username": finalParamedicId
    }) : null;

    const assignedDriver = finalDriverId ? await employeeCol.findOne({
      "ContactDetails.username": finalDriverId
    }) : null;

    return res.status(201).json({
      success: true,
      message: "Emergency created successfully",
      data: {
        emergency,
        assignedResources: {
          paramedic: assignedParamedic ? {
            username: assignedParamedic.ContactDetails.username,
            name: assignedParamedic.ContactDetails.name,
            employeeId: assignedParamedic.ContactDetails.employeeId,
            phoneNumber: assignedParamedic.ContactDetails.phoneNumber
          } : null,
          driver: assignedDriver ? {
            username: assignedDriver.ContactDetails.username,
            name: assignedDriver.ContactDetails.name,
            employeeId: assignedDriver.ContactDetails.employeeId,
            phoneNumber: assignedDriver.ContactDetails.phoneNumber
          } : null,
          ambulance: finalAmbulanceNumber
        }
      }
    });
  } catch (error) {
    console.error("Error creating emergency:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getAvailableResources = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.query;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required"
      });
    }

    const employeeCol = await getCollection<IEmployee>("Employee", hospitalId.toString());
    const hospitalCol = await getCollection<IHospital>("Hospitals", null);

    // Get available paramedics
    const availableParamedics = await employeeCol.find({
      // hospitalId: hospitalId.toString(),
      "HR.role.role": IADMIN.Paramedic,
      "HR.availabilityStatus": 'Available'
    }).toArray();

    console.log(availableParamedics)

    // Get available drivers
    const availableDrivers = await employeeCol.find({
      hospitalId: hospitalId.toString(),
      "HR.role.role": IADMIN.DRIVER,
      "HR.availabilityStatus": "Available"
    }).toArray();

    // Get available ambulances
    const hospital = await hospitalCol.findOne({ hospitalId: hospitalId.toString() });
    const emergencyCol = await getCollection<IEmergency>("Emergency", hospitalId.toString());

    let availableAmbulances: string[] = [];
    if (hospital?.ambulance) {
      const assignedAmbulances = await emergencyCol.find({
        status: EStatus.CREATED,
        ambulanceNumber: { $exists: true, $ne: "" }
      }).toArray();

      const assignedNumbers = assignedAmbulances.map(e => e.ambulanceNumber);
      availableAmbulances = hospital.ambulance
        .filter(amb => !assignedNumbers.includes(amb))
        .map(amb => amb);
    }

    return res.status(200).json({
      success: true,
      data: {
        paramedics: availableParamedics.map(p => ({
          username: p.ContactDetails.username,
          name: p.ContactDetails.name,
          employeeId: p.ContactDetails.employeeId,
          phoneNumber: p.ContactDetails.phoneNumber
        })),
        drivers: availableDrivers.map(d => ({
          username: d.ContactDetails.username,
          name: d.ContactDetails.name,
          employeeId: d.ContactDetails.employeeId,
          phoneNumber: d.ContactDetails.phoneNumber
        })),
        ambulances: availableAmbulances
      }
    });
  } catch (error) {
    console.error("Error fetching available resources:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


