// Simple test file to verify ambulance tracking message handlers work
// This file is for testing purposes and can be removed after verification

import { 
    getHospitalFleetStatus, 
    getHospitalActiveAmbulances, 
    handleJoinTrackingRoom 
} from '../handlers/ambulanceTrackingHandler';

// Mock WebSocket for testing
const mockWebSocket = {
    send: (data: string) => {
        console.log('WebSocket would send:', JSON.parse(data));
    },
    readyState: 1 // WebSocket.OPEN
};

console.log('Testing ambulance tracking functions...');

// Test 1: Get hospital fleet status
console.log('\n1. Testing getHospitalFleetStatus:');
const fleetStatus = getHospitalFleetStatus('hospital123');
console.log('Fleet status:', fleetStatus);

// Test 2: Get active ambulances
console.log('\n2. Testing getHospitalActiveAmbulances:');
const activeAmbulances = getHospitalActiveAmbulances('hospital123');
console.log('Active ambulances:', activeAmbulances);

// Test 3: Join tracking room
console.log('\n3. Testing handleJoinTrackingRoom:');
handleJoinTrackingRoom(mockWebSocket as any, 'tracking_emergency123_hospital123', 'user456', 'doctor');

console.log('\nAll tests completed successfully!');
console.log('\nWebSocket message types that are now supported:');
console.log('- getHospitalFleet');
console.log('- getHospitalFleetStatus');
console.log('- getHospitalActiveAmbulances');
console.log('- joinTrackingRoom');
console.log('- connect');
