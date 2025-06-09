import { decryptAESGCM } from "../encryption/enc";
import { CreateKeyResponse, GetKeyResponse, IKEY } from "./model";
import axios from "axios";

const host = "healthbackend.medochealth.in/8080" 
// change it to your own ip 
// or the server's domain if provided by the DevOps team


// TODO : Nothing... just do nothing consider all the functions below this line
// in this file as read-only. Don't write anything here. don't change any function here 
// or else it will break everything.
// phir rote rote mat aana ke "Bhai, Code phat Gaya"

const CONFIG = {
    "X-Client": "hplus",
    "Authorization": "XgNZYZVIgdjX0bK+EfS7PqIEQ3Zom3kp2kC5m80y1f8=",
}

// you also creates a new key only when you create a new user or a new record. 
export const createKey = async (user?: any) => {
    const res = await axios.post<CreateKeyResponse>(`https://${host}/create`, { user }, { headers: CONFIG });
    return res.data.keyId;

}
// This function fetches base64 key from kms based on KeyId 
// store the KeyId with each user (patient/doctor/hopital)
// and return the key as base64 string
// 
export const getKey = async (keyId: any): Promise<GetKeyResponse> => {
    const res = await axios.post(`https://${host}/get`, { keyId }, { headers: CONFIG });
    const key = String(res.data);
    const keyData = await decryptAESGCM(key, CONFIG.Authorization);
    const keyData0: IKEY = JSON.parse(keyData);
    console.log(keyData0)
    return {
        key: keyData0.key,
        IV: keyData0.iv
    };
}