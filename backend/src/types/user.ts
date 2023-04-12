import { RowDataPacket } from "mysql2"

export interface IUser extends RowDataPacket {
    user_id: number
    email: string
    username: string
    first_name?: string
    last_name?: string
    password: string
    ranked: boolean
    admin: boolean
    created_at: Date
}
