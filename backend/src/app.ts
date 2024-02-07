import * as dotenv from "dotenv";
import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./routes";
import path from "path";
import { Player } from "@prisma/client";
import * as fs from "fs";
import * as https from "https";

console.log("NODE_ENV:", process.env.NODE_ENV);

if (process.env.NODE_ENV !== "production") {
    dotenv.config({ path: `${__dirname}/../../../.env.development` });
}

declare global {
    namespace Express {
        export interface Request {
            player: Player;
        }
    }
}

const app: Express = express();

if (process.env.NODE_ENV === "production") {
    // Set static folder
    app.use(express.static(path.join(__dirname, "../build")));
} else {
    app.use(
        cors({
            origin: "http://localhost:3000",
            credentials: true,
        }),
    );
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../build/index.html"));
    });
}

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Error: ", err.message);
    res.status(err.status || 500).json(err.message);
    next();
});

const PORT: string | number = process.env.PORT || 80;

if (process.env.NODE_ENV === "production") {
    const privateKey = fs.readFileSync("../certificate/private.key");
    const certificate = fs.readFileSync("../certificate/certificate.crt");

    const credentials = { key: privateKey, cert: certificate };
    https.createServer(credentials, app).listen(443, () => {
        console.log("HTTPS Server running on port 443");
    });
} else {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}