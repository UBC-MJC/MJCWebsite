import { RowDataPacket } from "mysql2"

export interface IGame extends RowDataPacket {
    game_id: number
    created_at: Date
}
