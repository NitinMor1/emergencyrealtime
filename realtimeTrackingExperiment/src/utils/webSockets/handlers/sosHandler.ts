import WebSocket from 'ws';
import { ISOS } from '../../../features/emergency/sosModel';
import { clients } from '../utils/utils';
import { broadcastToHospital, broadcastToHospitals, broadcastToPatient } from '../utils/broadcast';

export function handleSosUpdate(sosData: ISOS) {
    const { hospitalId } = sosData;
    console.log(`SOS alert received for hospitals:`, sosData);

    const sosMessage = { type: 'sosAlert', ...sosData };

    if (Array.isArray(hospitalId)) {
        broadcastToHospitals(hospitalId, sosMessage);
    } else if (hospitalId) {
        broadcastToHospital(hospitalId, sosMessage);
    }
}

export function handleReceiveSOS(sosData: ISOS) {
    const { hospitalId } = sosData;
    console.log(`SOS alert received for hospitals:`, sosData);

    const sosMessage = { type: 'receiveSOS', ...sosData };

    if (Array.isArray(hospitalId)) {
        broadcastToHospitals(hospitalId, sosMessage);
    } else if (hospitalId) {
        broadcastToHospital(hospitalId, sosMessage);
    }
}

export function handleAcceptSos(sosData: ISOS) {
    const hospitalId = sosData.accepted?.hospitalId;
    console.log(`SOS alert accepted for hospital ${hospitalId}:`, sosData);

    const acceptMessage = {
        type: 'sosAccepted',
        sosId: sosData.sosId,
        emergencyId: sosData.emergencyId,
        acceptedBy: hospitalId,
        timestamp: new Date().toISOString()
    };

    // Notify all hospitals in the original request
    if (Array.isArray(sosData.hospitalId)) {
        broadcastToHospitals(sosData.hospitalId, acceptMessage);
    }

    // Notify the patient
    broadcastToPatient(sosData.patientId, acceptMessage);
}

export function notifySOSAccepted(sosData: ISOS, acceptedByHospitalId: string) {
    if (Array.isArray(sosData.hospitalId)) {
        const message = {
            type: 'sosAccepted',
            sosId: sosData.sosId,
            emergencyId: sosData.emergencyId,
            acceptedBy: acceptedByHospitalId,
            timestamp: new Date().toISOString()
        };

        broadcastToHospitals(sosData.hospitalId, message);
    }
}
    
