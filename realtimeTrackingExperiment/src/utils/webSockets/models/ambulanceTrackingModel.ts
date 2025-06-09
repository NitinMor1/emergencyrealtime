
export interface IAmbulanceLocation {
    latitude: number;
    longitude: number;
    address?: string;
    timestamp: Date;
    status: 'idle' | 'dispatched' | 'en_route' | 'at_scene' | 'transporting' | 'at_hospital' | 'maintenance';
    speed?: number;
    heading?: number;
}

export interface IAmbulanceTracking {
    emergencyId: string;
    ambulanceId: string;
    vehicleNumber: string;
    driverId?: string;
    driverName?: string;
    medicalTeam?: string[];
    hospitalId: string;
    currentLocation?: IAmbulanceLocation;
    lastKnownLocation?: IAmbulanceLocation;
    route?: IAmbulanceLocation[];
    status: 'idle' | 'dispatched' | 'en_route' | 'at_scene' | 'transporting' | 'at_hospital' | 'maintenance';
    dispatchTime?: Date;
    arrivalTime?: Date;
    patientPickupTime?: Date;
    hospitalArrivalTime?: Date;
    isActive: boolean;
    equipment?: string[];
    capacity: number;
    currentPatients?: number;
}

export interface IHospitalAmbulanceFleet {
    hospitalId: string;
    totalAmbulances: number;
    activeAmbulances: number;
    availableAmbulances: number;
    ambulances: Map<string, IAmbulanceTracking>;
    lastUpdated: Date;
}

export interface ITrackingRoom {
    roomId: string;
    emergencyId: string;
    hospitalId: string;
    participants: Map<string, {
        userId: string;
        userType: 'doctor' | 'nurse' | 'admin' | 'dispatcher' | 'ambulance_driver' | 'family';
        joinedAt: Date;
        ws: any; // WebSocket connection
    }>;
    ambulanceId?: string;
    createdAt: Date;
    isActive: boolean;
}

// In-memory storage for ambulance tracking data
export class AmbulanceTrackingStorage {
    private static instance: AmbulanceTrackingStorage;
    private readonly hospitalFleets: Map<string, IHospitalAmbulanceFleet> = new Map();
    private readonly trackingRooms: Map<string, ITrackingRoom> = new Map();
    private readonly ambulanceLocations: Map<string, IAmbulanceLocation[]> = new Map();

    private constructor() {}

    public static getInstance(): AmbulanceTrackingStorage {
        if (!AmbulanceTrackingStorage.instance) {
            AmbulanceTrackingStorage.instance = new AmbulanceTrackingStorage();
        }
        return AmbulanceTrackingStorage.instance;
    }

    public getHospitalFleet(hospitalId: string): IHospitalAmbulanceFleet | undefined {
        return this.hospitalFleets.get(hospitalId);
    }

    public setHospitalFleet(hospitalId: string, fleet: IHospitalAmbulanceFleet): void {
        this.hospitalFleets.set(hospitalId, fleet);
    }

    public addAmbulanceToFleet(hospitalId: string, ambulance: IAmbulanceTracking): void {
        let fleet = this.hospitalFleets.get(hospitalId);
        
        if (!fleet) {
            fleet = {
                hospitalId,
                totalAmbulances: 0,
                activeAmbulances: 0,
                availableAmbulances: 0,
                ambulances: new Map(),
                lastUpdated: new Date()
            };
        }

        fleet.ambulances.set(ambulance.ambulanceId, ambulance);
        fleet.totalAmbulances = fleet.ambulances.size;
        fleet.activeAmbulances = Array.from(fleet.ambulances.values()).filter(a => a.isActive).length;
        fleet.availableAmbulances = Array.from(fleet.ambulances.values()).filter(a => a.status === 'idle' && a.isActive).length;
        fleet.lastUpdated = new Date();

        this.hospitalFleets.set(hospitalId, fleet);
    }

    public updateAmbulanceLocation(ambulanceId: string, location: IAmbulanceLocation): void {
        // Store location history
        const history = this.ambulanceLocations.get(ambulanceId) || [];
        history.push(location);
        
        // Keep only last 100 locations
        if (history.length > 100) {
            history.shift();
        }
        
        this.ambulanceLocations.set(ambulanceId, history);

        // Update ambulance in all relevant fleets
        for (const fleet of this.hospitalFleets.values()) {
            const ambulance = fleet.ambulances.get(ambulanceId);
            if (ambulance) {
                ambulance.lastKnownLocation = location;
                ambulance.status = location.status;
                fleet.lastUpdated = new Date();
            }
        }
    }

    public getTrackingRoom(roomId: string): ITrackingRoom | undefined {
        return this.trackingRooms.get(roomId);
    }

    public createTrackingRoom(roomId: string, emergencyId: string, hospitalId: string, ambulanceId?: string): ITrackingRoom {
        const room: ITrackingRoom = {
            roomId,
            emergencyId,
            hospitalId,
            participants: new Map(),
            ambulanceId,
            createdAt: new Date(),
            isActive: true
        };
        
        this.trackingRooms.set(roomId, room);
        return room;
    }

    public addParticipantToRoom(roomId: string, userId: string, userType: string, ws: any): boolean {
        const room = this.trackingRooms.get(roomId);
        if (!room) return false;

        room.participants.set(userId, {
            userId,
            userType: userType as any,
            joinedAt: new Date(),
            ws
        });

        return true;
    }

    public removeParticipantFromRoom(roomId: string, userId: string): boolean {
        const room = this.trackingRooms.get(roomId);
        if (!room) return false;

        return room.participants.delete(userId);
    }

    public getAllTrackingRooms(): ITrackingRoom[] {
        return Array.from(this.trackingRooms.values());
    }
}
