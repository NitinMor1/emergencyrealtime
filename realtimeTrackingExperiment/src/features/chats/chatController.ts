import { IADMIN, IEmployee } from "../resource/HRMS/hrModel";
import { getCollection } from "../../db/db";
import { IChat, IUserPresence } from "./chatsModel";
import { Request, Response } from "express";
import { IDoctor } from "../account/doctors/DoctorModel";

export async function sendChat(
    hospitalId: string, 
    message: string, 
    sender: string, 
    receiver: string,
    messageType: 'text' | 'image' | 'file' = 'text',
    replyTo?: string
): Promise<any> {
    try {
        const newChat: IChat = {
            hospitalId,
            message,
            sender,
            receiver,
            timestamp: new Date().toISOString(),
            messageType,
            isRead: false,
            isDelivered: false,
            isEdited: false,
            replyTo
        };
        const chatColl = await getCollection<IChat>("Chats", hospitalId);
        const result = await chatColl.insertOne(newChat);
        return { ...newChat, _id: result.insertedId };
    } catch (error: any) {
        console.error("Error sending chat:", error);
        throw error;
    }
}

export async function markMessageAsRead(hospitalId: string, messageId: string, userId: string): Promise<any> {
    try {
        const chatColl = await getCollection<IChat>("Chats", hospitalId);
        const result = await chatColl.updateOne(
            { _id: messageId, receiver: userId },
            { 
                $set: { 
                    isRead: true,
                    readAt: new Date().toISOString()
                } 
            }
        );
        return result;
    } catch (error: any) {
        console.error("Error marking message as read:", error);
        throw error;
    }
}

export async function markMessageAsDelivered(hospitalId: string, messageId: string): Promise<any> {
    try {
        const chatColl = await getCollection<IChat>("Chats", hospitalId);
        const result = await chatColl.updateOne(
            { _id: messageId },
            { 
                $set: { 
                    isDelivered: true,
                    deliveredAt: new Date().toISOString()
                } 
            }
        );
        return result;
    } catch (error: any) {
        console.error("Error marking message as delivered:", error);
        throw error;
    }
}

export async function deleteMessage(hospitalId: string, messageId: string, userId: string, deleteForAll: boolean = false): Promise<any> {
    try {
        const chatColl = await getCollection<IChat>("Chats", hospitalId);
        
        if (deleteForAll) {
            const result = await chatColl.updateOne(
                { _id: messageId, sender: userId },
                { 
                    $set: { 
                        messageType: 'deleted',
                        message: 'This message was deleted',
                        deletedAt: new Date().toISOString(),
                        deletedBy: userId
                    } 
                }
            );
            return result;
        } else {
            // For delete for me only, we would need a more complex structure
            // For now, we'll use the same approach
            const result = await chatColl.deleteOne({ _id: messageId, sender: userId });
            return result;
        }
    } catch (error: any) {
        console.error("Error deleting message:", error);
        throw error;
    }
}

export async function updateUserPresence(hospitalId: string, userId: string, isOnline: boolean): Promise<any> {
    try {
        const presenceColl = await getCollection<IUserPresence>("UserPresence", hospitalId);
        const result = await presenceColl.updateOne(
            { userId, hospitalId },
            { 
                $set: { 
                    isOnline,
                    lastSeen: new Date().toISOString(),
                    hospitalId
                } 
            },
            { upsert: true }
        );
        return result;
    } catch (error: any) {
        console.error("Error updating user presence:", error);
        throw error;
    }
}

export async function getUserPresence(hospitalId: string, userId: string): Promise<IUserPresence | null> {
    try {
        const presenceColl = await getCollection<IUserPresence>("UserPresence", hospitalId);
        const presence = await presenceColl.findOne({ userId, hospitalId });
        return presence;
    } catch (error: any) {
        console.error("Error getting user presence:", error);
        return null;
    }
}


export const getChats = async (req: Request, res: Response) => {
    try {
        const { hospitalId, sender, receiver } = req.query;
        const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
        const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
        const limit = upperLimit - lowerLimit; // Calculate the limit for the query

        if (limit <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid range: upperLimit must be greater than lowerLimit"
            });
        }
        const chatColl = await getCollection<IChat>(
            "Chats", hospitalId?.toString()
        )
        const chats = await chatColl.find({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ]
        }).skip(lowerLimit).limit(limit).toArray();
        return res.status(200).json({
            success: true,
            message: "Chats fetched successfully",
            data: chats
        })
    } catch (error: any) {
        console.error("Error getting chats:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getNursesChat = async (req: Request, res: Response) => {
    try {
        const hospitalId = req.query.hospitalId as string;
        const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
        const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items
        const limit = upperLimit - lowerLimit; // Calculate the limit for the query

        if (limit <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid range: upperLimit must be greater than lowerLimit"
            });
        }
        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing hospitalId"
            })
        }
        const nurseColl = await getCollection<IEmployee>(
            "Employee", hospitalId
        )
        const nurses = await nurseColl.find({
            "HR.role": IADMIN.NURSE
        }).skip(lowerLimit).limit(limit).toArray();
        if (nurses.length == 0) {
            return res.status(404).json({
                success: false,
                message: "No nurses found"
            })
        } else {
            return res.status(200).json({
                success: true,
                message: "Nurses fetched successfully",
                data: nurses.map(nurse => {
                    return {
                        name: nurse.ContactDetails.name,
                        employeeId: nurse.ContactDetails.employeeId
                    }
                })
            })
        }
    } catch (error: any) {
        console.error("Error getting nurses:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getDoctorChat = async (req: Request, res: Response) => {
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

        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing hospitalId",
            });
        }

        const doctorColl = await getCollection<IDoctor>("DoctorList", null);
        const doctors: IDoctor[] = await doctorColl.find({
            listOfHospitals: hospitalId?.toString()
        }).skip(lowerLimit).limit(limit).toArray();

        if (doctors.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No doctors found for the given hospital",
            });
        } else {
            return res.status(200).json({
                success: true,
                data: doctors.map(doctor => {
                    return {
                        name: doctor.doctorName,
                        doctorId: doctor.doctorUsername
                    }
                }),
            });
        }

    } catch (error: any) {
        console.error("Error getting doctors:", error);
        res.status(500).json({
            success: false,
            message: "Error getting doctors",
        });
    }
}


export const getAllEmployeesChatList = async (req: Request, res: Response) => {
    try{
        const hospitalId = req.query.hospitalId as string;
        const lowerLimit = parseInt(req.query.lowerLimit as string) || 0; // Default to 0
        const upperLimit = parseInt(req.query.upperLimit as string) || 1000; // Default to 1000 items

        const limit = upperLimit - lowerLimit; // Calculate the limit for the query
        if(limit <= 0){
            return res.status(400).json({
                success: false,
                message: "Invalid range: upperLimit must be greater than lowerLimit"
            })
        }
        if(!hospitalId){
            return res.status(400).json({
                success: false,
                message: "Invalid or missing hospitalId"
            })
        }

        const employeeColl = await getCollection<IEmployee>(
            "Employee", hospitalId
        )
        const employees = await employeeColl.find({}).skip(lowerLimit).limit(limit).toArray();
        if(employees.length == 0){
            return res.status(404).json({
                success: false,
                message: "No employees found"
            })
        }
        else{
            return res.status(200).json({
                success: true,
                message: "Employees fetched successfully",
                data: employees.map(employee => {
                    return {
                        _id: employee._id,
                        name: employee.ContactDetails.name,
                        phoneNumber: employee.ContactDetails.phoneNumber,
                    }
                })
            })
        }
    }catch(error: any){
        console.error("Error getting all employees:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export async function getChatHistory(hospitalId: string, sender: string, receiver: string, page: number = 1, limit: number = 50): Promise<any> {
    try {
        const chatColl = await getCollection<IChat>("Chats", hospitalId);
        const skip = (page - 1) * limit;
        
        const chats = await chatColl.find({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ]
        })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
        
        const totalChats = await chatColl.countDocuments({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ]
        });
        
        return {
            chats: chats.reverse(), // Reverse to show oldest first
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalChats / limit),
                totalChats,
                hasMore: skip + chats.length < totalChats
            }
        };
    } catch (error: any) {
        console.error("Error getting chat history:", error);
        throw error;
    }
}

export async function getUnreadMessageCount(hospitalId: string, userId: string): Promise<number> {
    try {
        const chatColl = await getCollection<IChat>("Chats", hospitalId);
        const count = await chatColl.countDocuments({
            receiver: userId,
            isRead: false
        });
        return count;
    } catch (error: any) {
        console.error("Error getting unread message count:", error);
        return 0;
    }
}

export async function editMessage(hospitalId: string, messageId: string, newMessage: string, userId: string): Promise<any> {
    try {
        const chatColl = await getCollection<IChat>("Chats", hospitalId);
        
        const result = await chatColl.updateOne(
            { _id: messageId, sender: userId },
            { 
                $set: { 
                    message: newMessage,
                    isEdited: true,
                    editedAt: new Date().toISOString()
                } 
            }
        );
        return result;
    } catch (error: any) {
        console.error("Error editing message:", error);
        throw error;
    }
}

export const uploadChatFile = async (req: Request, res: Response) => {
    try {
        const { hospitalId, sender, receiver } = req.body;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file provided"
            });
        }
        
        // Here you would typically upload to cloud storage (Cloudinary, AWS S3, etc.)
        // For now, we'll simulate a file URL
        const fileUrl = `/uploads/${req.file.filename}`;
        const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'file';
        
        const fileMessage = await sendChat(
            hospitalId,
            fileUrl,
            sender,
            receiver,
            fileType
        );
        
        return res.status(200).json({
            success: true,
            message: "File uploaded successfully",
            data: fileMessage
        });
    } catch (error: any) {
        console.error("Error uploading file:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const searchMessages = async (req: Request, res: Response) => {
    try {
        const { hospitalId, query, sender, receiver } = req.query;
        
        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }
        
        const chatColl = await getCollection<IChat>("Chats", hospitalId?.toString());
        const searchFilter: any = {
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ],
            message: { $regex: query, $options: 'i' },
            messageType: { $ne: 'deleted' }
        };
        
        const messages = await chatColl.find(searchFilter)
            .sort({ timestamp: -1 })
            .limit(100)
            .toArray();
        
        return res.status(200).json({
            success: true,
            message: "Search completed successfully",
            data: messages
        });
    } catch (error: any) {
        console.error("Error searching messages:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};