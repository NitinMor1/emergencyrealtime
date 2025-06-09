import { getCollection } from "../../../db/db";
import argon2 from "argon2";
import { IDoctor } from "../doctors/DoctorModel";
import { IPatient } from "../patients/PatientModel";
import {hash} from "../patients/patientController"
async function checkExistingUsername(username: string): Promise<boolean> {
  const userColl = await getCollection<IDoctor>("DoctorList", null);
  const existingUser = await userColl.findOne({ doctorUsername: username });
  return existingUser ? true : false;
}

async function checkExistingPatientUsername(username: string): Promise<boolean> {
  const userColl = await getCollection<IPatient>("PatientList", null);
  const existingUser = await userColl.findOne({ username });
  return existingUser ? true : false;
}
export function getUsername(name: string, phoneNumber: string) {
  const formattedName = name.replace(/\s+/g, "_");
  return `${formattedName}_${hash(`${phoneNumber}`).substring(9,15)}@medoc`;
}

export function getEmployeeId(name: string, phoneNumber: string): string {
  return `emp_${hash(`${name}+${phoneNumber}`).substring(9,15)}`;
}


export function getPatientUsername(name: string, phoneNumber:string): string {
  const formattedName = name.replace(/\s+/g, "");
  // if the username already taken
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${formattedName.toLowerCase()}_${hash(`${phoneNumber}`).substring(9,15)}@medoc`;
}

export async function hashPass(pass: string): Promise<string> {
  const hashedPassword = await argon2.hash(pass, {
    type: argon2.argon2id,
    memoryCost: 3 * 1024,
    parallelism: 8,
    timeCost: 3,
  });
  return hashedPassword;
}

export async function verifyPassword(
  storedHash: string | null,
  inputPassword: string
): Promise<boolean> {
  console.log(
    storedHash,
    inputPassword,
    await argon2.verify(storedHash!, inputPassword)
  );
  return storedHash ? await argon2.verify(storedHash, inputPassword) : false;
}


