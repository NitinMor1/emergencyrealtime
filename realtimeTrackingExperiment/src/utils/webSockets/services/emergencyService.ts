// import { EmergencyData, DispatchInfo, ClientInfo } from '../types';
// import { generateEmergencyId } from '../core/clientManager';
// import { 
//     sendEmergencyToHospital, 
//     sendToUser, 
//     sendToParamedicsInHospital,
//     sendToDepartment,
//     sendToRoleInDepartment
// } from './messagingService';

// // Active emergencies tracking
// const activeEmergencies = new Map<string, {
//     emergencyId: string;
//     patientId: string;
//     hospitalId: string;
//     assignedParamedicId?: string;
//     status: 'pending' | 'accepted' | 'dispatched' | 'en_route' | 'arrived' | 'completed' | 'cancelled';
//     createdAt: string;
//     acceptedAt?: string;
//     dispatchedAt?: string;
//     completedAt?: string;
// }>();

// // Handle patient emergency with hospital isolation
// export function handlePatientEmergency(
//     patientId: string,
//     targetHospitalId: string,
//     emergencyDetails: {
//         location: {
//             lat: number;
//             lng: number;
//             address?: string;
//         };
//         emergencyType: string;
//         description: string;
//         priority: 'low' | 'medium' | 'high' | 'critical';
//         patientName?: string;
//         vitals?: {
//             heartRate?: number;
//             bloodPressure?: string;
//             temperature?: number;
//             oxygenSaturation?: number;
//         };
//     }
// ): string {
//     const emergencyId = generateEmergencyId();
//     const timestamp = new Date().toISOString();
    
//     const emergencyData: EmergencyData = {
//         emergencyId,
//         patientId,
//         hospitalId: targetHospitalId,
//         condition: emergencyDetails.description,
//         status: 'pending',
//         requestedBy: patientId,
//         requestedByRole: 'patient',
//         ...emergencyDetails,
//         timestamp
//     };

//     // Track the emergency
//     activeEmergencies.set(emergencyId, {
//         emergencyId,
//         patientId,
//         hospitalId: targetHospitalId,
//         status: 'pending',
//         createdAt: timestamp
//     });

//     // Send only to the specific hospital's emergency department
//     const sentCount = sendToDepartment(targetHospitalId, 'emergency', {
//         type: 'emergency_request',
//         data: emergencyData
//     });
    
//     // Send confirmation back to patient
//     sendToUser(patientId, {
//         type: 'emergency_request_sent',
//         emergencyId,
//         hospitalId: targetHospitalId,
//         message: `Emergency request sent to hospital ${targetHospitalId}`,
//         timestamp,
//         success: sentCount > 0
//     });

//     console.log(`Emergency ${emergencyId} created for patient ${patientId} targeting hospital ${targetHospitalId}`);
//     return emergencyId;
// }

// // Hospital accepts emergency request
// export function acceptEmergencyRequest(
//     emergencyId: string,
//     hospitalUserId: string,
//     estimatedResponse?: string
// ): boolean {
//     const emergency = activeEmergencies.get(emergencyId);
//     if (!emergency || emergency.status !== 'pending') {
//         return false;
//     }

//     emergency.status = 'accepted';
//     emergency.acceptedAt = new Date().toISOString();

//     // Notify patient
//     sendToUser(emergency.patientId, {
//         type: 'emergency_accepted',
//         emergencyId,
//         hospitalId: emergency.hospitalId,
//         acceptedBy: hospitalUserId,
//         estimatedResponse,
//         timestamp: emergency.acceptedAt
//     });

//     // Notify hospital emergency department
//     sendToDepartment(emergency.hospitalId, 'emergency', {
//         type: 'emergency_accepted_confirmation',
//         emergencyId,
//         acceptedBy: hospitalUserId,
//         patientId: emergency.patientId,
//         timestamp: emergency.acceptedAt
//     });

//     console.log(`Emergency ${emergencyId} accepted by hospital user ${hospitalUserId}`);
//     return true;
// }

// // Dispatch paramedics for an emergency
// export function dispatchParamedics(
//     hospitalId: string,
//     emergencyId: string,
//     dispatchInfo: DispatchInfo
// ): number {
//     const emergency = activeEmergencies.get(emergencyId);
//     if (!emergency) {
//         console.error(`Emergency ${emergencyId} not found`);
//         return 0;
//     }

//     emergency.status = 'dispatched';
//     emergency.dispatchedAt = new Date().toISOString();
    
//     if (dispatchInfo.assignedParamedicId) {
//         emergency.assignedParamedicId = dispatchInfo.assignedParamedicId;
//     }

//     const message = {
//         type: 'paramedic_dispatch',
//         emergencyId,
//         hospitalId,
//         data: {
//             ...dispatchInfo,
//             timestamp: emergency.dispatchedAt
//         }
//     };

//     // Send to specific paramedic if assigned, otherwise all paramedics in hospital
//     let sentCount = 0;
//     if (dispatchInfo.assignedParamedicId) {
//         sentCount = sendToUser(dispatchInfo.assignedParamedicId, message);
//     } else {
//         sentCount = sendToParamedicsInHospital(hospitalId, message);
//     }

//     // Notify patient about dispatch
//     sendToUser(emergency.patientId, {
//         type: 'paramedics_dispatched',
//         emergencyId,
//         hospitalId,
//         estimatedArrival: dispatchInfo.estimatedArrival,
//         timestamp: emergency.dispatchedAt
//     });

//     console.log(`Paramedics dispatched for emergency ${emergencyId}`);
//     return sentCount;
// }

// // Update emergency status
// export function updateEmergencyStatus(
//     emergencyId: string,
//     newStatus: 'en_route' | 'arrived' | 'completed' | 'cancelled',
//     userId: string,
//     additionalData?: any
// ): boolean {
//     const emergency = activeEmergencies.get(emergencyId);
//     if (!emergency) {
//         return false;
//     }

//     const previousStatus = emergency.status;
//     emergency.status = newStatus;
//     const timestamp = new Date().toISOString();

//     if (newStatus === 'completed') {
//         emergency.completedAt = timestamp;
//     }

//     // Notify relevant parties
//     const statusUpdate = {
//         type: 'emergency_status_update',
//         emergencyId,
//         previousStatus,
//         newStatus,
//         updatedBy: userId,
//         timestamp,
//         ...additionalData
//     };

//     // Notify patient
//     sendToUser(emergency.patientId, statusUpdate);

//     // Notify hospital emergency department
//     sendToDepartment(emergency.hospitalId, 'emergency', statusUpdate);

//     // If paramedic is assigned, notify them too
//     if (emergency.assignedParamedicId) {
//         sendToUser(emergency.assignedParamedicId, statusUpdate);
//     }

//     console.log(`Emergency ${emergencyId} status updated from ${previousStatus} to ${newStatus} by ${userId}`);
//     return true;
// }

// // Get emergency details
// export function getEmergencyDetails(emergencyId: string) {
//     return activeEmergencies.get(emergencyId);
// }

// // Get all active emergencies for a hospital
// export function getHospitalEmergencies(hospitalId: string) {
//     const hospitalEmergencies: any[] = [];
//     activeEmergencies.forEach((emergency) => {
//         if (emergency.hospitalId === hospitalId && emergency.status !== 'completed' && emergency.status !== 'cancelled') {
//             hospitalEmergencies.push(emergency);
//         }
//     });
//     return hospitalEmergencies;
// }

// // Notify emergency department about incoming patient
// export function notifyEmergencyDepartment(
//     hospitalId: string,
//     patientInfo: {
//         patientId: string;
//         emergencyId?: string;
//         eta: string;
//         condition: string;
//         priority: 'low' | 'medium' | 'high' | 'critical';
//         vitals?: any;
//         specialRequirements?: string[];
//     }
// ) {
//     const message = {
//         type: 'incoming_patient_notification',
//         hospitalId,
//         data: {
//             ...patientInfo,
//             timestamp: new Date().toISOString()
//         }
//     };

//     // Send to emergency department
//     const sentCount = sendToDepartment(hospitalId, 'emergency', message);

//     // Also notify doctors and nurses in emergency department
//     sendToRoleInDepartment(hospitalId, 'emergency', 'doctor', message);
//     sendToRoleInDepartment(hospitalId, 'emergency', 'nurse', message);

//     console.log(`Incoming patient notification sent to emergency department of hospital ${hospitalId}`);
//     return sentCount;
// }

// // Export active emergencies for monitoring
// export { activeEmergencies };
