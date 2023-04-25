import * as dotenv from 'dotenv'
import express, { Express, NextFunction, Request, Response } from 'express';
import cors from "cors"
import bodyParser from "body-parser";

import router from "./routes"
import {createAdmin} from "./services/admin.service";

dotenv.config({path: __dirname + '/.env'});

const app: Express = express()

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(router)

// Error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.log("Error: ", err.message);
    res.status(err.status || 500).json(err.message)
});

const PORT: string | number = process.env.PORT || 4000


createAdmin().then(() => {
    app.listen(PORT, () =>
        console.log(`Server running on http://localhost:${PORT}`)
    )
}).catch((err: any) => {
    console.log(err)
})
