import { ITEMTYPE } from "../resource/Inventory/inventoryModel";

export interface IEquipment {
    hospitalId: string;
    itemId: string;
    name: string;
    type: ITEMTYPE;
    roomId: string;
    issuedOn: string | Date;
    returnedOn: string | Date;
    issuedFrom : string | Date;
    issuedTo: string;
    quantity: number;
}

export interface issued{
    issuedOn: string | Date;
    returnedOn: string | Date;
    issuedFrom: string | Date;
    issuedTo: string;
    quantity: number;
}

/*
{
"hospitalId": "hos_7BA7CF",
"itemId": "equip_123",
"name": "stethoscope",
"type": "device",
"roomId": "room_12BC23",
"issuedOn": "2022-12-12",
"returnedOn": "2022-12-12",
"issuedFrom": "hos_7BA7CF",
"issuedTo": "hos_7BA7CF",
"quantity": 100
}
*/