import fs from 'fs';
import path from 'path';

const logFilePath = path.join(__dirname, "app.log");
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });
const errorFilePath = path.join(__dirname, "../", "error.log");
console.log(errorFilePath);
const errorStream = fs.createWriteStream(errorFilePath, { flags: "a" });


export const info = function (...message: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} [INFO] ${message}\n`;
    logStream.write(logMessage.toString());
};
export const error = function (...message: any) {
    const timestamp = new Date().toISOString();
    const errorMessage = `${timestamp} [ERROR] ${message}\n`;
    errorStream.write(errorMessage.toString());
}

