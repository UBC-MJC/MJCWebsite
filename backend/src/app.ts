import * as dotenv from "dotenv";
import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./routes";
import path from "path";
import { Player } from "@prisma/client";

console.log("NODE_ENV:", process.env.NODE_ENV );

if (process.env.NODE_ENV !== 'production') {
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
    app.use(express.static(path.join(__dirname, '../build')));
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
    app.get("*", (req,res) => {
        res.sendFile(path.join(__dirname, '../build/index.html'));
    });
}

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Error: ", err.message);
    res.status(err.status || 500).json(err.message);
    next();
});

const PORT: string | number = process.env.PORT || 80;

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
