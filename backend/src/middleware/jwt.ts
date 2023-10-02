import jwt, { Secret, SignOptions } from "jsonwebtoken";

require("dotenv").config();

const accessTokenSecret: Secret = process.env.ACCESS_TOKEN_SECRET || "";
const generateToken = (payload: object | string, options: SignOptions = {}) => {
    return jwt.sign(payload, accessTokenSecret, {
        ...(options && options),
    });
};

const verifyToken = (token: string): string | undefined => {
    try {
        return jwt.verify(token, accessTokenSecret) as string;
    } catch (error) {
        return undefined;
    }
};

export { generateToken, verifyToken };
