import { v4 as uuidv4 } from "uuid";

export function generateId(prefix: string | undefined | null): string {
    if (!prefix) {
        return uuidv4().substring(0, 6).toUpperCase(); // Take the first 5 characters and convert to uppercase
    } else {
        return prefix + uuidv4().substring(0, 6).toUpperCase(); // Take the first 5 characters and convert to uppercase
        // return `${prefix}_${uuidv4().substring(0, 5).toUpperCase()}`; // Take the first 5 characters and convert to uppercase
    }
}

export function generateBillingId(prefix: string | undefined | null): string {
    if (!prefix) {
        return uuidv4().substring(0, 10).toUpperCase(); // Take the first 5 characters and convert to uppercase
    } else {
        return prefix + uuidv4().substring(0, 10).toUpperCase(); // Take the first 5 characters and convert to uppercase
        // return `${prefix}_${uuidv4().substring(0, 5).toUpperCase()}`; // Take the first 5 characters and convert to uppercase
    }
}

