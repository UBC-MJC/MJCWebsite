import * as dotenv from 'dotenv'
import express, { Express } from "express"
import cors from "cors"
import router from "./routes"

dotenv.config({ path: __dirname+'/.env' });

const app: Express = express()

const PORT: string | number = process.env.PORT || 4000

app.use(cors())
app.use(router)

app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
)
