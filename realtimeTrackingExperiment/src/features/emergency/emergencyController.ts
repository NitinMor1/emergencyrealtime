import { Request, Response } from "express";
import { getCollection } from "../../db/db";
import { IEmergency, EEmergencyType, EStatus, ILocation, IRejection } from "./emergencyModel";
import { IUser } from "../account/users/UserModel";
import { ObjectId } from "mongodb";
import { IHospital } from "../auth/HospitalModel";
import { IEmployee } from "../resource/HRMS/hrModel";
import { v4 as uuidv4 } from "uuid";

export const createEmergency = async (req: Request, res: Response) => {
  try {
    const {
      hospitalId,
      emergencyType,
      emergencyLocation,
      emergencyTime,
      driver,
      vehicleNumber,
      vehicleLocation,
      // available, // why ?
      creatorId,
      isCompleted,
      completedTime,
      patient,
      assigneeId
    } = req.body;

    const emergencyCol = await getCollection<IEmergency>(
      "Emergency",
      hospitalId?.toString());
    const NumberOfEmergencyPresent = await emergencyCol.countDocuments();
    console.log(NumberOfEmergencyPresent)
    const checkAvailCol = await getCollection<IHospital>("Hospitals", null);
    const checkAvail = await checkAvailCol.findOne({ hospitalId: hospitalId.toString() });
    console.log(checkAvail)
    if (!checkAvail || !checkAvail.ambulance || checkAvail.ambulance.length <= NumberOfEmergencyPresent) {
      return res.status(400).json({
        success: true,
        message: "Ambulance not available",
      })
    }

    const alreadyAssigned = await emergencyCol.findOne({ assigneeId: assigneeId })
    const driverAssigned = await emergencyCol.findOne({ driver: driver });
    if (alreadyAssigned || driverAssigned) {
      return res.status(400).json({
        success: true,
        message: "Driver or Paramedic already assigned to another emergency.",
      })
    }

    const emergency: IEmergency = {
      hospitalId,
      creatorId,
      emergencyId: `emer_${uuidv4().substring(0, 6)}`,
      emergencyType,
      emergencyLocation,
      emergencyTime,
      driver,
      isCompleted: false,
      completedTime,
      vehicleNumber,
      vehicleLocation,
      available: true,
      patient,
      assigneeId
    };

    await emergencyCol.insertOne(emergency);

    return res.status(201).json({
      success: true,
      data: emergency
    });
  } catch (error) {
    console.error("Error creating emergency:", error);
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
      return res.status(200).json({
        success: true,
        data: emergency
      });
    } else {
      const emergencies = await emergencyColl.find({}).toArray();
      return res.status(200).json({
        success: true,
        data: emergencies
      });
    }
  } catch (error) {
    console.error("Error fetching emergency:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const updateEmergency = async (req: Request, res: Response) => {
  try {
    const { hospitalId, emergencyId } = req.query;
    const updateData = req.body;

    if (!hospitalId || !emergencyId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID and Emergency ID are required"
      });
    }

    const emergencyColl = await getCollection<IEmergency>("Emergency", hospitalId.toString());

    // Handle status updates with special cases
    if (updateData.status === EStatus.COMPLETED) {
      updateData.completedAt = new Date().toISOString();
    }

    // Handle rejection if provided
    if (updateData.rejection) {
      const rejection: IRejection = {
        isRequestRejected: true,
        rejectedBy: updateData.rejection.rejectedBy || "Unknown",
        reason: updateData.rejection.reason || "No reason provided"
      };
      updateData.rejection = rejection;
      updateData.status = EStatus.REJECTED;
    }

    const result = await emergencyColl.updateOne(
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
      message: "Emergency updated successfully"
    });
  } catch (error) {
    console.error("Error updating emergency:", error);
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

    const emergencyColl = await getCollection<IEmergency>("Emergency", hospitalId.toString());
    const result = await emergencyColl.deleteOne({ emergencyId: emergencyId.toString() });

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

export const getAmbulanceList = async (req: Request, res: Response) => {
  try {
    const { hospitalId } = req.query;
    const ambulanceColl = await getCollection<IHospital>("Hospitals", null);
    const ambulance = await ambulanceColl.findOne({ hospitalId: hospitalId?.toString() });
    if (!ambulance) {
      return res.status(404).json({
        success: true,
        message: "Ambulance not found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Ambulance fetched successfully",
        data: ambulance.ambulance,
      });
    }
  } catch (e: any) {
    console.error("Error in fetching Emergency", e);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export const getDriverDetailsFromMongoId = async (req: Request, res: Response) => {
  try {
    const { hospitalId, driverId } = req.query;

    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: "Driver ID is required",
      });
    }

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required",
      });
    }

    // Get Employee collection instead of Emergency collection
    const employeeCol = await getCollection<IEmployee>(
      "Employee",
      hospitalId as string
    );

    const employeeDetails = await employeeCol.aggregate([
      {
        $match: {
          _id: new ObjectId(driverId as string),
          hospitalId: hospitalId as string // Ensure we're fetching from correct hospital
        }
      },
      {
        $project: {
          _id: 1,
          "ContactDetails.name": 1,
          "ContactDetails.email": 1,
          "ContactDetails.phoneNumber": 1,
          "ContactDetails.address": 1,
          "ContactDetails.dateOfBirth": 1,
          "ContactDetails.gender": 1,
          "ContactDetails.employeeId": 1,
          "ContactDetails.username": 1,
          "ContactDetails.profilePicture": 1
        }
      }
    ]).next();

    if (!employeeDetails) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee details fetched successfully",
      data: {
        _id: employeeDetails._id,
        ContactDetails: employeeDetails.ContactDetails
      },
    });
  } catch (error: any) {
    console.error("Error in fetching employee details", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}


export const getParamedicDetailsFromMongoId = async (req: Request, res: Response) => {
  try {
    const { hospitalId, paramedicId } = req.query;

    if (!paramedicId) {
      return res.status(400).json({
        success: false,
        message: "Paramedic ID is required",
      });
    }

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required",
      });
    }

    // Get Employee collection instead of Emergency collection
    const employeeCol = await getCollection<IEmployee>(
      "Employee",
      hospitalId as string
    );

    const employeeDetails = await employeeCol.aggregate([
      {
        $match: {
          _id: new ObjectId(paramedicId as string),
          hospitalId: hospitalId as string // Ensure we're fetching from correct hospital
        }
      },
      {
        $project: {
          _id: 1,
          "ContactDetails.name": 1,
          "ContactDetails.email": 1,
          "ContactDetails.phoneNumber": 1,
          "ContactDetails.address": 1,
          "ContactDetails.dateOfBirth": 1,
          "ContactDetails.gender": 1,
          "ContactDetails.employeeId": 1,
          "ContactDetails.username": 1,
          "ContactDetails.profilePicture": 1
        }
      }
    ]).next();
    if (!employeeDetails) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Employee details fetched successfully",
      data: {
        _id: employeeDetails._id,
        ContactDetails: employeeDetails.ContactDetails
      },
    });
  } catch (error: any) {
    console.error("Error in fetching paramedic details", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}