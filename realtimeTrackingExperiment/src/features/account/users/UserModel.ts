

// Interface for User document type
export interface IUser {
  hospitalId: string;
  name: string;
  email: string;
  username: string;
  password: string;
  role: string;
  permissions: string;
  hospitalName: string;
  address: string;
  contactInfo: string;
}



/*
{
  "hospitalId": "hos_7BA7CF",
  "name": "xyz",
  "email": "xyz123@gmail.com",
  "username": "xyz123",
  "password": "xyz123",
  "role": "admin",
  "permissions": "all",
  "hospitalName": "xyz hospital",
  "address": "xyz address",
  "contactInfo": "contact_123" 
}

*/