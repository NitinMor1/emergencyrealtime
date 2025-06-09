import { v4 as uuidv4 } from "uuid";
import jwt, { TokenExpiredError } from 'jsonwebtoken'
import { NextFunction, Request, Response } from "express";
import dotenv from 'dotenv';
dotenv.config();

export function generatePasskey(prefix: string | undefined | null): string {
    if (!prefix) {
        return uuidv4().substring(0, 6).toUpperCase(); // Take the first 6 characters and convert to uppercase
    } else {
        return "hos_" + uuidv4().substring(0, 6).toUpperCase(); // Take the first 6 characters and convert to uppercase
    }
}
export async function generateJWTToken(hospitalId: string, passkey: string): Promise<string> {
    const payLoad = { hospitalId, passkey }
    console.log(process.env.JWT_SECRET_KEY)
    console.log(process.env.JWT_EXPIRE_TIME)
    return jwt.sign(payLoad, process.env.JWT_SECRET_KEY as string , { expiresIn: process.env.JWT_EXPIRE_TIME as string })
}
export async function generateRefreshToken(hospitalId: string, passkey: string): Promise<string> {
    const payLoad = { hospitalId, passkey }
    const secret = process.env.JWT_SECRET_KEY ? process.env.JWT_SECRET_KEY as string : "hplusbackendsecretkey";
    const expiresIn = process.env.JWT_REFRESH_EXPIRE_TIME ? process.env.JWT_REFRESH_EXPIRE_TIME as string : "30d"
    console.log(process.env.JWT_SECRET_KEY)
    console.log(process.env.JWT_REFRESH_EXPIRE_TIME)
    return jwt.sign(payLoad, secret, { expiresIn })
}
export async function verifyJWT(req: Request, res: Response, next: NextFunction) {
    try {
        let sessionToken = req.headers?.authorization?.split(" ")[1] || req.body.sessionToken
        if (!sessionToken?.trim()) {
            return res.status(400).json({
                success: true,
                message: "Session token is required"
            })
        }
        const _ = await jwt.verify(sessionToken, process.env.JWT_SECRET_KEY as string || "hplusbackendsecretkey");
        return next();
    }
    catch (error) {
        console.log("JWT verification failed due to following error: \n", error);
        if (error instanceof TokenExpiredError) {
            return res.status(400).json({
                success: false,
                message: "JWT token expired !!"
            })
        }
        return res.status(500).json({
            success: "false",
            message: "Invalid Session Token !!"
        })
    }
}
export async function verifyRefreshToken(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET_KEY as string);
}