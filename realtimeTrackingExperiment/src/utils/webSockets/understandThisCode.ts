// // Types for better type safety
// interface ClientInfo {
//     ws: WebSocket;
//     userId: string;
//     hospitalId?: string;
//     role: 'hospital' | 'paramedic' | 'patient' | 'doctor' | 'nurse' | 'admin' | 'receptionist' | 'technician' | 'pharmacist';
//     department?: string; // e.g., 'emergency', 'cardiology', 'surgery', etc.
//     specialization?: string; // e.g., 'cardiologist', 'surgeon', 'general', etc.
// }

// // Enhanced clients map to store client information with roles
// const clients = new Map<string, ClientInfo[]>();
// const hospitalClients = new Map<string, ClientInfo[]>(); // hospitalId -> hospital clients
// const departmentClients = new Map<string, Map<string, ClientInfo[]>>(); // hospitalId -> department -> clients

// export function handleWebSocketConnection(ws: WebSocket, req: IncomingMessage) {
//     // Extract parameters from query
//     const url = new URL(req.url ?? '', `http://${req.headers.host}`);
//     const hospitalId = url.searchParams.get('hospitalId');
//     const userId = url.searchParams.get('userId');
//     const role = url.searchParams.get('role'); // 'hospital', 'paramedic', 'patient', 'doctor', 'nurse', etc.
//     const department = url.searchParams.get('department'); // 'emergency', 'cardiology', 'surgery', etc.
//     const specialization = url.searchParams.get('specialization'); // 'cardiologist', 'surgeon', etc.

//     console.log(`WebSocket Connection Details:
//         Hospital ID: ${hospitalId ?? 'N/A'}
//         User ID: ${userId ?? 'N/A'}
//         Role: ${role ?? 'N/A'}
//         Department: ${department ?? 'N/A'}
//         Specialization: ${specialization ?? 'N/A'}
//     `);

//     // Validate required parameters
//     if (!userId) {
//         console.error('WebSocket connection rejected: No userId provided');
//         ws.send(JSON.stringify({
//             type: 'error',
//             message: 'User ID is required for WebSocket connection'
//         }));
//         ws.close();
//         return { userId: null, hospitalId: null, role: null };
//     }

//     const validRoles = ['hospital', 'paramedic', 'patient', 'doctor', 'nurse', 'admin', 'receptionist', 'technician', 'pharmacist'];
//     if (!role || !validRoles.includes(role)) {
//         console.error('WebSocket connection rejected: Invalid or missing role');
//         ws.send(JSON.stringify({
//             type: 'error',
//             message: `Role is required and must be one of: ${validRoles.join(', ')}`
//         }));
//         ws.close();
//         return { userId: null, hospitalId: null, role: null };
//     }

//     // For hospital staff roles, hospitalId is required
//     const hospitalStaffRoles = ['hospital', 'doctor', 'nurse', 'admin', 'receptionist', 'technician', 'pharmacist'];
//     if (hospitalStaffRoles.includes(role) && !hospitalId) {
//         console.error(`WebSocket connection rejected: ${role} role requires hospitalId`);
//         ws.send(JSON.stringify({
//             type: 'error',
//             message: `Hospital ID is required for ${role} role`
//         }));
//         ws.close();
//         return { userId: null, hospitalId: null, role: null };
//     }

//     // Create client info object
//     const clientInfo: ClientInfo = {
//         ws,
//         userId,
//         hospitalId: hospitalId || undefined,
//         role: role as ClientInfo['role'],
//         department: department || undefined,
//         specialization: specialization || undefined
//     };

//     // Add client to general clients map
//     if (!clients.has(userId)) {
//         clients.set(userId, []);
//     }
//     clients.get(userId)?.push(clientInfo);

//     // If it's a hospital staff member, also add to hospital-specific map
//     const hospitalStaffRoles = ['hospital', 'doctor', 'nurse', 'admin', 'receptionist', 'technician', 'pharmacist'];
//     if (hospitalStaffRoles.includes(role) && hospitalId) {
//         if (!hospitalClients.has(hospitalId)) {
//             hospitalClients.set(hospitalId, []);
//         }
//         hospitalClients.get(hospitalId)?.push(clientInfo);

//         // If department is specified, add to department-specific map
//         if (department) {
//             if (!departmentClients.has(hospitalId)) {
//                 departmentClients.set(hospitalId, new Map());
//             }
//             const hospitalDepts = departmentClients.get(hospitalId)!;
//             if (!hospitalDepts.has(department)) {
//                 hospitalDepts.set(department, []);
//             }
//             hospitalDepts.get(department)?.push(clientInfo);
//         }
//     }

//     console.log(`Added WebSocket for ${role} ${userId}. Total connections for user: ${clients.get(userId)?.length}`);

//     // Handle WebSocket close event
//     ws.on('close', () => {
//         removeClient(userId, ws);
//     });

//     // Handle WebSocket error event
//     ws.on('error', (error:any) => {
//         console.error(`WebSocket error for user ${userId}:`, error.message);
//         removeClient(userId, ws);
//     });

//     logClientConnections();

//     return { userId, hospitalId, role };
// }

// // Function to remove client from all maps
// function removeClient(userId: string, ws: WebSocket) {
//     // Remove from general clients map
//     const userClients = clients.get(userId);
//     if (userClients) {
//         const index = userClients.findIndex(client => client.ws === ws);
//         if (index > -1) {
//             const removedClient = userClients.splice(index, 1)[0];
            
//             // If it was a hospital staff member, also remove from hospital and department maps
//             const hospitalStaffRoles = ['hospital', 'doctor', 'nurse', 'admin', 'receptionist', 'technician', 'pharmacist'];
//             if (hospitalStaffRoles.includes(removedClient.role) && removedClient.hospitalId) {
//                 // Remove from hospital clients map
//                 const hospitalClientList = hospitalClients.get(removedClient.hospitalId);
//                 if (hospitalClientList) {
//                     const hospitalIndex = hospitalClientList.findIndex(client => client.ws === ws);
//                     if (hospitalIndex > -1) {
//                         hospitalClientList.splice(hospitalIndex, 1);
                        
//                         // Clean up empty hospital entries
//                         if (hospitalClientList.length === 0) {
//                             hospitalClients.delete(removedClient.hospitalId);
//                         }
//                     }
//                 }

//                 // Remove from department clients map
//                 if (removedClient.department) {
//                     const hospitalDepts = departmentClients.get(removedClient.hospitalId);
//                     if (hospitalDepts) {
//                         const deptClients = hospitalDepts.get(removedClient.department);
//                         if (deptClients) {
//                             const deptIndex = deptClients.findIndex(client => client.ws === ws);
//                             if (deptIndex > -1) {
//                                 deptClients.splice(deptIndex, 1);
                                
//                                 // Clean up empty department entries
//                                 if (deptClients.length === 0) {
//                                     hospitalDepts.delete(removedClient.department);
//                                     if (hospitalDepts.size === 0) {
//                                         departmentClients.delete(removedClient.hospitalId);
//                                     }
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//         }
        
//         // Clean up empty user entries
//         if (userClients.length === 0) {
//             clients.delete(userId);
//         }
//     }
// }

// // Send emergency request to specific hospital only
// export function sendEmergencyToHospital(
//     hospitalId: string,
//     emergencyData: {
//         patientId: string;
//         patientName?: string;
//         location: string;
//         emergencyType: string;
//         description: string;
//         timestamp: string;
//         [key: string]: any;
//     }
// ) {
//     const message = {
//         type: 'emergency_request',
//         hospitalId,
//         data: emergencyData
//     };

//     const messageString = JSON.stringify(message);
//     const hospitalClientList = hospitalClients.get(hospitalId);

//     if (hospitalClientList && hospitalClientList.length > 0) {
//         let sentCount = 0;
//         hospitalClientList.forEach((clientInfo) => {
//             if (clientInfo.ws.readyState === WebSocket.OPEN) {
//                 clientInfo.ws.send(messageString);
//                 sentCount++;
//             }
//         });
        
//         console.log(`Emergency request sent to ${sentCount} hospital clients for hospital ${hospitalId}`);
//         return sentCount;
//     } else {
//         console.log(`No active hospital clients found for hospital ${hospitalId}`);
//         return 0;
//     }
// }

// // Broadcast to all clients of a specific role
// export function broadcastToRole(
//     role: ClientInfo['role'],
//     message: Object,
//     excludeUserId?: string
// ) {
//     const messageString = JSON.stringify(message);
//     let sentCount = 0;

//     clients.forEach((clientList, userId) => {
//         if (excludeUserId && userId === excludeUserId) return;
        
//         clientList.forEach((clientInfo) => {
//             if (clientInfo.role === role && clientInfo.ws.readyState === WebSocket.OPEN) {
//                 clientInfo.ws.send(messageString);
//                 sentCount++;
//             }
//         });
//     });

//     console.log(`Broadcast sent to ${sentCount} ${role} clients`);
//     return sentCount;
// }

// // Send message to specific user
// export function sendToUser(
//     userId: string,
//     message: Object
// ) {
//     const messageString = JSON.stringify(message);
//     const userClients = clients.get(userId);
    
//     if (userClients) {
//         let sentCount = 0;
//         userClients.forEach((clientInfo) => {
//             if (clientInfo.ws.readyState === WebSocket.OPEN) {
//                 clientInfo.ws.send(messageString);
//                 sentCount++;
//             }
//         });
        
//         console.log(`Message sent to ${sentCount} connections for user ${userId}`);
//         return sentCount;
//     } else {
//         console.log(`No active connections found for user ${userId}`);
//         return 0;
//     }
// }

// // Send message to specific department in a hospital
// export function sendToDepartment(
//     hospitalId: string,
//     department: string,
//     message: Object
// ) {
//     const messageString = JSON.stringify(message);
//     let sentCount = 0;

//     const hospitalDepts = departmentClients.get(hospitalId);
//     if (hospitalDepts) {
//         const deptClients = hospitalDepts.get(department);
//         if (deptClients) {
//             deptClients.forEach((clientInfo) => {
//                 if (clientInfo.ws.readyState === WebSocket.OPEN) {
//                     clientInfo.ws.send(messageString);
//                     sentCount++;
//                 }
//             });
//         }
//     }

//     console.log(`Message sent to ${sentCount} clients in ${department} department of hospital ${hospitalId}`);
//     return sentCount;
// }

// // Send message to specific role in a specific hospital
// export function sendToRoleInHospital(
//     hospitalId: string,
//     role: ClientInfo['role'],
//     message: Object
// ) {
//     const messageString = JSON.stringify(message);
//     let sentCount = 0;

//     const hospitalClientList = hospitalClients.get(hospitalId);
//     if (hospitalClientList) {
//         hospitalClientList.forEach((clientInfo) => {
//             if (clientInfo.role === role && clientInfo.ws.readyState === WebSocket.OPEN) {
//                 clientInfo.ws.send(messageString);
//                 sentCount++;
//             }
//         });
//     }

//     console.log(`Message sent to ${sentCount} ${role}s in hospital ${hospitalId}`);
//     return sentCount;
// }

// // Send message to specific role in specific department
// export function sendToRoleInDepartment(
//     hospitalId: string,
//     department: string,
//     role: ClientInfo['role'],
//     message: Object
// ) {
//     const messageString = JSON.stringify(message);
//     let sentCount = 0;

//     const hospitalDepts = departmentClients.get(hospitalId);
//     if (hospitalDepts) {
//         const deptClients = hospitalDepts.get(department);
//         if (deptClients) {
//             deptClients.forEach((clientInfo) => {
//                 if (clientInfo.role === role && clientInfo.ws.readyState === WebSocket.OPEN) {
//                     clientInfo.ws.send(messageString);
//                     sentCount++;
//                 }
//             });
//         }
//     }

//     console.log(`Message sent to ${sentCount} ${role}s in ${department} department of hospital ${hospitalId}`);
//     return sentCount;
// }

// // Send message to doctors with specific specialization
// export function sendToSpecialist(
//     hospitalId: string,
//     specialization: string,
//     message: Object
// ) {
//     const messageString = JSON.stringify(message);
//     let sentCount = 0;

//     const hospitalClientList = hospitalClients.get(hospitalId);
//     if (hospitalClientList) {
//         hospitalClientList.forEach((clientInfo) => {
//             if (clientInfo.role === 'doctor' && 
//                 clientInfo.specialization === specialization && 
//                 clientInfo.ws.readyState === WebSocket.OPEN) {
//                 clientInfo.ws.send(messageString);
//                 sentCount++;
//             }
//         });
//     }

//     console.log(`Message sent to ${sentCount} ${specialization} specialists in hospital ${hospitalId}`);
//     return sentCount;
// }

// // Get statistics about connected clients
// export function getConnectionStats() {
//     const stats = {
//         totalConnections: 0,
//         hospitals: 0,
//         paramedics: 0,
//         patients: 0,
//         doctors: 0,
//         nurses: 0,
//         admins: 0,
//         receptionists: 0,
//         technicians: 0,
//         pharmacists: 0,
//         hospitalBreakdown: {} as Record<string, number>,
//         departmentBreakdown: {} as Record<string, Record<string, number>>,
//         specializationBreakdown: {} as Record<string, number>
//     };

//     clients.forEach((clientList) => {
//         clientList.forEach((clientInfo) => {
//             stats.totalConnections++;
            
//             // Count by role
//             const roleKey = `${clientInfo.role}s` as keyof typeof stats;
//             if (typeof stats[roleKey] === 'number') {
//                 (stats[roleKey] as number)++;
//             }
            
//             // Count by hospital
//             if (clientInfo.hospitalId) {
//                 stats.hospitalBreakdown[clientInfo.hospitalId] = 
//                     (stats.hospitalBreakdown[clientInfo.hospitalId] || 0) + 1;
//             }

//             // Count by department
//             if (clientInfo.hospitalId && clientInfo.department) {
//                 if (!stats.departmentBreakdown[clientInfo.hospitalId]) {
//                     stats.departmentBreakdown[clientInfo.hospitalId] = {};
//                 }
//                 stats.departmentBreakdown[clientInfo.hospitalId][clientInfo.department] = 
//                     (stats.departmentBreakdown[clientInfo.hospitalId][clientInfo.department] || 0) + 1;
//             }

//             // Count by specialization
//             if (clientInfo.specialization) {
//                 stats.specializationBreakdown[clientInfo.specialization] = 
//                     (stats.specializationBreakdown[clientInfo.specialization] || 0) + 1;
//             }
//         });
//     });

//     return stats;
// }

// function logClientConnections() {
//     const stats = getConnectionStats();
//     console.log('=== WebSocket Connection Stats ===');
//     console.log(`Total Connections: ${stats.totalConnections}`);
//     console.log(`Hospitals: ${stats.hospitals}`);
//     console.log(`Doctors: ${stats.doctors}`);
//     console.log(`Nurses: ${stats.nurses}`);
//     console.log(`Paramedics: ${stats.paramedics}`);
//     console.log(`Patients: ${stats.patients}`);
//     console.log(`Admins: ${stats.admins}`);
//     console.log(`Receptionists: ${stats.receptionists}`);
//     console.log(`Technicians: ${stats.technicians}`);
//     console.log(`Pharmacists: ${stats.pharmacists}`);
    
//     if (Object.keys(stats.hospitalBreakdown).length > 0) {
//         console.log('Hospital Breakdown:');
//         Object.entries(stats.hospitalBreakdown).forEach(([hospitalId, count]) => {
//             console.log(`  Hospital ${hospitalId}: ${count} connections`);
//         });
//     }

//     if (Object.keys(stats.departmentBreakdown).length > 0) {
//         console.log('Department Breakdown:');
//         Object.entries(stats.departmentBreakdown).forEach(([hospitalId, depts]) => {
//             console.log(`  Hospital ${hospitalId}:`);
//             Object.entries(depts).forEach(([dept, count]) => {
//                 console.log(`    ${dept}: ${count} connections`);
//             });
//         });
//     }

//     if (Object.keys(stats.specializationBreakdown).length > 0) {
//         console.log('Specialization Breakdown:');
//         Object.entries(stats.specializationBreakdown).forEach(([spec, count]) => {
//             console.log(`  ${spec}: ${count} connections`);
//         });
//     }
//     console.log('================================');
// }

// // Example usage functions:

// // When a patient sends an emergency request
// export function handlePatientEmergency(
//     patientId: string,
//     targetHospitalId: string,
//     emergencyDetails: {
//         location: string;
//         emergencyType: string;
//         description: string;
//         patientName?: string;
//     }
// ) {
//     const emergencyData = {
//         patientId,
//         ...emergencyDetails,
//         timestamp: new Date().toISOString()
//     };

//     // Send only to the specific hospital
//     const sentCount = sendEmergencyToHospital(targetHospitalId, emergencyData);
    
//     // Optionally, send confirmation back to patient
//     sendToUser(patientId, {
//         type: 'emergency_sent',
//         message: `Emergency request sent to hospital ${targetHospitalId}`,
//         timestamp: emergencyData.timestamp
//     });

//     return sentCount > 0;
// }

// // When hospital wants to dispatch paramedics
// export function dispatchParamedics(
//     hospitalId: string,
//     dispatchInfo: {
//         emergencyId: string;
//         location: string;
//         priority: 'low' | 'medium' | 'high' | 'critical';
//         instructions: string;
//     }
// ) {
//     const message = {
//         type: 'paramedic_dispatch',
//         hospitalId,
//         data: {
//             ...dispatchInfo,
//             timestamp: new Date().toISOString()
//         }
//     };

//     return sendToRoleInHospital(hospitalId, 'paramedic', message);
// }

// // Notify emergency department about incoming patient
// export function notifyEmergencyDepartment(
//     hospitalId: string,
//     patientInfo: {
//         patientId: string;
//         eta: string;
//         condition: string;
//         priority: 'low' | 'medium' | 'high' | 'critical';
//         vitals?: any;
//     }
// ) {
//     const message = {
//         type: 'incoming_patient',
//         data: {
//             ...patientInfo,
//             timestamp: new Date().toISOString()
//         }
//     };

//     return sendToDepartment(hospitalId, 'emergency', message);
// }

// // Request specialist consultation
// export function requestSpecialistConsultation(
//     hospitalId: string,
//     specialization: string,
//     consultationInfo: {
//         patientId: string;
//         requestingDoctor: string;
//         urgency: 'routine' | 'urgent' | 'emergency';
//         reason: string;
//         patientLocation: string;
//     }
// ) {
//     const message = {
//         type: 'consultation_request',
//         data: {
//             ...consultationInfo,
//             timestamp: new Date().toISOString()
//         }
//     };

//     return sendToSpecialist(hospitalId, specialization, message);
// }

// // Notify nursing staff about patient updates
// export function notifyNursingStaff(
//     hospitalId: string,
//     department: string,
//     nursingUpdate: {
//         patientId: string;
//         updateType: 'medication' | 'vitals' | 'care_plan' | 'discharge' | 'admission';
//         details: string;
//         priority: 'low' | 'medium' | 'high';
//     }
// ) {
//     const message = {
//         type: 'nursing_update',
//         data: {
//             ...nursingUpdate,
//             timestamp: new Date().toISOString()
//         }
//     };

//     return sendToRoleInDepartment(hospitalId, department, 'nurse', message);
// }

// // Send pharmacy notifications
// export function notifyPharmacy(
//     hospitalId: string,
//     prescriptionInfo: {
//         patientId: string;
//         doctorId: string;
//         medications: Array<{
//             name: string;
//             dosage: string;
//             frequency: string;
//             duration: string;
//         }>;
//         priority: 'routine' | 'urgent' | 'stat';
//     }
// ) {
//     const message = {
//         type: 'prescription_order',
//         data: {
//             ...prescriptionInfo,
//             timestamp: new Date().toISOString()
//         }
//     };

//     return sendToRoleInHospital(hospitalId, 'pharmacist', message);
// }

// // Admin notifications for hospital management
// export function notifyAdministration(
//     hospitalId: string,
//     adminNotification: {
//         type: 'bed_availability' | 'staff_alert' | 'equipment_status' | 'emergency_protocol';
//         message: string;
//         priority: 'low' | 'medium' | 'high' | 'critical';
//         department?: string;
//     }
// ) {
//     const message = {
//         type: 'admin_notification',
//         data: {
//             ...adminNotification,
//             timestamp: new Date().toISOString()
//         }
//     };

//     return sendToRoleInHospital(hospitalId, 'admin', message);
// }