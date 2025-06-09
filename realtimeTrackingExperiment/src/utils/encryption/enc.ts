import crypto from "crypto";
import { base64ToByteArray, } from "./utils";

// TODO : Nothing... just do nothing consider all the functions
// in this file as read-only. Don't write anything here. don't change any function here 
// or else it will break everything.
// phir rote rote mat aana ke "Bhai, Code phat Gaya"


// Hash the identifiers like email, phone, passkeys, etc 
// (especially the ones used for authentication)
// use the similar manner in either frontend or in login request
export function hashData(data: any): string {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('base64');
}
export async function decryptAESGCM(ciphertextBase64: any, keyBase64: any): Promise<string> {
    const ciphertext = base64ToByteArray(ciphertextBase64);
    const key = base64ToByteArray(keyBase64);

    // Convert the key to a CryptoKey object
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
    );
    console.log(cryptoKey)

    // The nonce is the first part of the ciphertext
    const nonceSize = 12;  // AES-GCM typically uses a 12-byte nonce
    if (ciphertext.length < nonceSize) {
        throw new Error("data to decrypt is too small");
    }

    const nonce = ciphertext.slice(0, nonceSize);
    const data = ciphertext.slice(nonceSize);
    // console.log(nonce, "\n", data);
    try {
        // Decrypt the data using AES-GCM
        const decryptedData = await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: nonce
            },
            cryptoKey,
            data
        );
        console.log(decryptedData)
        // Return the plaintext as an ArrayBuffer
        return new TextDecoder('utf-8').decode(decryptedData);

    } catch (err: any) {
        console.log(err)
        throw new Error("Decryption failed: " + err);
    }
}

export async function encryptAESGCM(plaintext: string, keyBase64: string): Promise<Uint8Array> {
    // Convert base64 key to Uint8Array
    const key = base64ToByteArray(keyBase64);

    // Generate a random nonce (12 bytes for AES-GCM)
    const nonce = crypto.getRandomValues(new Uint8Array(12));

    // Import the encryption key
    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "AES-GCM" },
        false,
        ["encrypt"]
    );

    // Encrypt the plaintext using AES-GCM
    const encryptedData = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: nonce
        },
        cryptoKey,
        new TextEncoder().encode(plaintext)
    );

    // Combine nonce and ciphertext (nonce is prepended to ciphertext)
    const combinedCiphertext = new Uint8Array(nonce.length + encryptedData.byteLength);
    combinedCiphertext.set(nonce, 0);
    combinedCiphertext.set(new Uint8Array(encryptedData), nonce.length);

    // Convert the combined ciphertext to base64 and return it
    return combinedCiphertext;
}


// Encryption function
export function encryptDeterministic(plaintext: string, key: Uint8Array, iv: Uint8Array): string {
    // The fixed IV to ensure deterministic results
    const fixedIV = Buffer.from(iv); // 16 bytes for AES-128

    // Ensure the key length is suitable for AES (16 bytes for AES-128, 32 bytes for AES-256)
    if (key.length !== 32) { // 32 bytes for AES-256
        throw new Error('Invalid key length. It must be 16 bytes for AES-128.');
    }

    // Create AES cipher using CBC mode with the fixed IV
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), fixedIV);

    // Pad plaintext to match block size (16 bytes for AES)
    const padding = 16 - (plaintext.length % 16);
    const paddedText = Buffer.concat([Buffer.from(plaintext), Buffer.alloc(padding, padding)]);

    // Encrypt the padded plaintext
    const encrypted = Buffer.concat([cipher.update(paddedText), cipher.final()]);

    // Return the Base64-encoded encrypted data as a string
    return encrypted.toString('base64');
}

// Decryption function
export function decryptDeterministic(encrypted: string, key: Uint8Array, iv: Uint8Array): string {
    // The fixed IV to ensure deterministic results
    const fixedIV = Buffer.from(iv); // 16 bytes for AES-128

    // Decode the Base64-encoded encrypted string
    const encryptedBuffer = Buffer.from(encrypted, 'base64');

    // Create AES decipher using CBC mode with the fixed IV
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), fixedIV);

    // Decrypt the ciphertext
    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

    // Remove the padding
    const padding = decrypted[decrypted.length - 1];
    const plaintext = decrypted.slice(0, decrypted.length - padding).toString();

    return plaintext;
}

// Example Usage
const key = Buffer.from('cd914fd884a913cdcd914fd884a913cd'); // 32 bytes for AES-128
const iv = Buffer.from('cd914fd884a913ce');

// const plaintext = 'hello world';

// // Encrypt the plaintext
// const encrypted = encryptDeterministic(plaintext, key);
// console.log('Encrypted:', encrypted);

// // Decrypt the ciphertext
// const decrypted = decryptDeterministic(encrypted, key);
// console.log('Decrypted:', decrypted);



type Transformable = Record<string, any>;

// Recursive function to transform an object's properties 
export async function transformObject<T extends Transformable>(
    obj: T,
    transform: (plaintext: string, key: Buffer, iv: Buffer) => string,
    k: Buffer,
    iv: Buffer,
    excludeKeys: string[] = [],
    hashKeys: string[] = []

): Promise<T> {
    const result: Transformable = {};

    for (const key in obj) {
        const value = obj[key];
        if (excludeKeys.includes(key)) {
            console.log(excludeKeys, key, value)
            result[key] = value; // Skip excluded keys
        } else if (hashKeys.includes(key) && value) {
            console.log(hashKeys, key, value)
            result[key] = hashData(value);
        }
        else if (null === value || "" === value || (Array.isArray(value) && value.length === 0)) {
            result[key] = value;
        } else if (typeof value === 'number' || typeof value === 'bigint') {
            result[key] = transform(String(value), k, iv); // Convert number to string and transform
        }
        else if (typeof value === 'string') {
            result[key] = transform(value, k, iv); // Apply transformation to strings
        } else if (Array.isArray(value)) {
            result[key] = value.map((item: any) =>
                item === null || '' === item ?
                    item
                    : transform(String(item), k, iv)
            ); // Apply transformation to array items

        }
        else if (typeof value === 'object' && value !== null) {
            result[key] = transformObject(value, transform, k, iv, excludeKeys,); // Recursively transform nested objects
        } else {
            result[key] = value; // Copy other types as is
        }
    }

    return result as T;
}

var user = {
    "_id": "675ace851187d6f0343194f6",
    "hospitalId": "hos_EFC647",
    "officeId": "O_551485",
    "patientId": "P_a6ca5ddf-81c4-4",
    "username": "RAJAT_SHRIVASTAV_9192@medoc",
    "email": "",
    "name": "Rajat Shrivastav",
    "age": {
        "$numberInt": "21"
    },
    "gender": "",
    "password": "",
    "patientGrowth": [
        {
            "growthId": "growth_cad8cc2",
            "date": "2003-07-17",
            "bmi": {
                "$numberInt": "0"
            },
            "height": {
                "$numberInt": "0"
            },
            "weight": {
                "$numberInt": "0"
            },
            "patientOfficeId": "hos_EFC647"
        }
    ],
    "bloodGroup": "",
    "address": "",
    "pincode": "",
    "phoneNumber": "9987654321",
    "secondaryPhoneNumber": "",
    "dob": "2003-07-17",
    "group": "",
    "flag": "",
    "familyHistory": "",
    "parentsDetails": {
        "motherHeight": {
            "$numberInt": "0"
        },
        "motherName": "",
        "motherProfession": "",
        "fatherHeight": {
            "$numberInt": "0"
        },
        "fatherName": "",
        "fatherProfession": ""
    },
    "allergies": "",
    "additionalNotes": "",
    "preTermDays": {
        "$numberInt": "0"
    },
    "referredBy": "",
    "school": "",
    "family": [],
    "vitals": [
        {
            "patientUsername": "RAJAT_SHRIVASTAV_9192@medoc",
            "patientOfficeId": "hos_EFC647",
            "date": null,
            "time": "05:25",
            "note": "",
            "status": "recorded",
            "unit": "",
            "value": "",
            "vitalId": "vital_0145ece2-6429-44d7-a167-803149b193a3",
            "vitalName": "Body Temperature"
        },
        {
            "patientUsername": "RAJAT_SHRIVASTAV_9192@medoc",
            "patientOfficeId": "hos_EFC647",
            "date": null,
            "time": "14:00",
            "note": "",
            "status": "recorded",
            "unit": "",
            "value": "",
            "vitalId": "vital_cf6c23c8-a16f-4424-9e93-d50a2d030fcf",
            "vitalName": "Body Temperature"
        }
    ],
    "listOfHospitals": [
        "hos_EFC647"
    ],
    "listOfDoctors": [],
    "profileUrl": "",
    "personalHealth": null,
    "patientVaccination": []
}
// const u1 = { "list": ["hos"] }
// //encryptDeterministic("helloe", key, iv);
// const val = transformObject(u1, encryptDeterministic, key, iv, ['_id', 'patientId', 'patientOfficeId']);
// console.log(val);
// const val2 = transformObject(val, decryptDeterministic, key, iv, ['_id', 'patientId', 'patientOfficeId']);
// console.log(val2);