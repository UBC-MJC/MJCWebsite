import * as dotenv from "dotenv";
import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import router from "./routes";
import path from "path";
import { Player } from "@prisma/client";

// Load environment-specific .env file
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
dotenv.config({ path: `${__dirname}/../../${envFile}` });

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Loaded env file:", envFile);

declare module "express-serve-static-core" {
    interface Request {
        player: Player;
    }
}

const app: Express = express();

if (process.env.NODE_ENV === "production") {
    // Set static folder
    app.use(express.static(path.join(__dirname, "../../dist")));
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
app.use(cookieParser());

app.use("/api", router);

if (process.env.NODE_ENV === "production") {
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../../dist/index.html"));
    });
}

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Error: ", err.message);
    res.status(err.status || 500).json(err.message);
    next();
});

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : process.env.NODE_ENV === "production" ? 8080 : 4000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
