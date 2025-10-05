import jwt, { SignOptions } from "jsonwebtoken";
import * as dotenv from "dotenv";

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

const getAccessTokenSecret = () =>  {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new Error("ACCESS_TOKEN_SECRET is not defined in environment variables");
    }
    return process.env.ACCESS_TOKEN_SECRET;
}

export { generateToken, verifyToken };
