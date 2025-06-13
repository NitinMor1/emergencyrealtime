import WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { ClientInfo, UserRole } from '../types';
import {
    addClient,
    removeClient,
    logClientConnections
} from '../core/clientManager';

export function handleWebSocketConnection(ws: WebSocket, req: IncomingMessage) {
    // Extract parameters from query
    const url = new URL(req.url ?? '', `http://${req.headers.host}`);
    const hospitalId = url.searchParams.get('hospitalId');
    const userId = url.searchParams.get('userId');
    const role = url.searchParams.get('role');
    const department = url.searchParams.get('department');
    const specialization = url.searchParams.get('specialization');

    console.log(`WebSocket Connection Details:
        Hospital ID: ${hospitalId ?? 'N/A'}
        User ID: ${userId ?? 'N/A'}
        Role: ${role ?? 'N/A'}
        Department: ${department ?? 'N/A'}
        Specialization: ${specialization ?? 'N/A'}
    `);

    // Validate required parameters
    if (!userId) {
        console.error('WebSocket connection rejected: No userId provided');
        ws.send(JSON.stringify({
            type: 'error',
            message: 'User ID is required for WebSocket connection'
        }));
        ws.close();
        return { userId: null, hospitalId: null, role: null };
    }

    const validRoles: UserRole[] = ['hospital', 'paramedic', 'patient', 'doctor', 'nurse', 'admin', 'receptionist', 'technician', 'pharmacist'];

    if (!role || !validRoles.includes(role as UserRole)) {
        console.error('WebSocket connection rejected: Invalid or missing role');
        ws.send(JSON.stringify({
            type: 'error',
            message: `Role is required and must be one of: ${validRoles.join(', ')}`
        }));
        ws.close();
        return { userId: null, hospitalId: null, role: null };
    }

    // For hospital staff roles, hospitalId is required
    const hospitalStaffRoles: UserRole[] = ['hospital', 'doctor', 'nurse', 'admin', 'receptionist', 'technician', 'pharmacist'];

    if (hospitalStaffRoles.includes(role as UserRole) && !hospitalId) {
        console.error(`WebSocket connection rejected: ${role} role requires hospitalId`);
        ws.send(JSON.stringify({
            type: 'error',
            message: `Hospital ID is required for ${role} role`
        }));
        ws.close();
        return { userId: null, hospitalId: null, role: null };
    }

    // Create client info object
    const clientInfo: ClientInfo = {
        ws,
        userId,
        hospitalId: hospitalId ?? undefined,
        role: role as UserRole,
        department: department ?? undefined,
        specialization: specialization ?? undefined,
        isOnline: true,
        lastSeen: new Date()
    };

    // Add client to appropriate maps
    addClient(clientInfo);

    // Handle WebSocket close event
    ws.on('close', () => {
        removeClient(userId, ws);
    });

    // Handle WebSocket error event
    ws.on('error', (error: Error) => {
        console.error(`WebSocket error for user ${userId}:`, error);
        removeClient(userId, ws);
    });


    // Send connection success message
    ws.send(JSON.stringify({
        type: 'connection_established',
        success: true,
        clientInfo: {
            userId,
            hospitalId,
            role,
            department,
            specialization
        },
        timestamp: new Date().toISOString()
    }));

    logClientConnections();

    return { userId, hospitalId, role };
}