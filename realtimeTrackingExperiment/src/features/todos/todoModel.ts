export interface ITodo {
  hospitalId: string;
  creatorId: string;
  assignedToId: string;
  title: string;
  description: string;
  status: todoStatus;
  priority: EPriority;
  keyId?: string | undefined;
}

export enum todoStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  RECEIVED = "Received",
  INPROGRESS = "InProgress",
  CANCELLED = "Cancelled",
  REJECTED = "Rejected",
  EXPIRED = "Expired",
  PICKUPED = "Pickuped",
}

export enum EPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  Emergency = 'Emergency',
  Critical = 'Critical',
  Pickup = 'Pickup',
}


/*
create a json format for the data to be sent
{
  "hospitalId": "hos_1A3D31",
  "creatorId": "66eeea6effb0b73ebb104583",
  "assignedToId": "66eeeabdffb0b73ebb104585",
  "title": "Critical condition",
  "description": "testing the critical enum",
  "status": "Pending",
  "priority": "Critical"
}
*/