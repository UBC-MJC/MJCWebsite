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

declare module "express-serve-static-core" {
    interface Request {
        player: Player;
    }
}

const app: Express = express();

if (process.env.NODE_ENV === "production") {
    // Set static folder
    app.use(express.static(path.join(__dirname, "../dist")));
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
        res.sendFile(path.join(__dirname, "../dist/index.html"));
    });
}

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Error: ", err.message);
    res.status(err.status || 500).json(err.message);
    next();
});

const PORT: string | number = process.env.PORT || 80;

if (process.env.NODE_ENV === "production") {
    const httpApp = express();
    httpApp.get("*", (req, res) => {
        res.redirect("https://" + req.headers.host + req.url);
    });
    httpApp.listen(80, () => {
        console.log("HTTP Server running on port 80");
    });

    const privateKey = fs.readFileSync(path.join(__dirname, "../certificate/mjcserver.key"));
    const certificate = fs.readFileSync(path.join(__dirname, "../certificate/_.ubc.gg.crt"));
    const ca = fs.readFileSync(path.join(__dirname, "../certificate/GandiCert.pem"));

    const credentials = { key: privateKey, cert: certificate, ca: ca };
    https.createServer(credentials, app).listen(443, () => {
        console.log("HTTPS Server running on port 443");
    });
} else {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}
