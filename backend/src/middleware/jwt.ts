import jwt, { SignOptions } from "jsonwebtoken";
import * as dotenv from "dotenv";
import { Response } from "express";

dotenv.config();

const generateToken = (payload: object | string, options: SignOptions = {}) => {
    return jwt.sign(payload, getAccessTokenSecret(), {
        ...(options && options),
    });
};

const verifyToken = (token: string): string | undefined => {
    try {
        return jwt.verify(token, getAccessTokenSecret()) as string;
    } catch (error) {
        return undefined;
    }
};

const addAuthCookieToResponse = (res: Response, token: string, isSecure: boolean) => {
    res.cookie("authToken", token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: "strict",
        maxAge: 6 * 30 * 24 * 60 * 60 * 1000, // 6 months
    });
}

const getAccessTokenSecret = () => {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new Error("ACCESS_TOKEN_SECRET is not defined in environment variables");
    }
    return process.env.ACCESS_TOKEN_SECRET;
};

export { generateToken, verifyToken, addAuthCookieToResponse };
