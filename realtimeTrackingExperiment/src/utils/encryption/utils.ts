// Converts a base64-encoded string to a Uint8Array

export function base64ToByteArray(base64: string): Uint8Array {

    var buff = Buffer.from(base64, 'base64');
    console.log("buff", base64.length, buff.BYTES_PER_ELEMENT, buff.length)
    return Uint8Array.from(buff);
}

// Converts a Uint8Array to a base64-encoded string
export function byteArrayToBase64(buffer: Uint8Array): string {
    return Buffer.from(buffer).toString('base64');
}