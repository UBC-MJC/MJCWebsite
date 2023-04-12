import { RowDataPacket } from "mysql2"

export interface IRound extends RowDataPacket {
    round_id: number
    game_id: number
    round_number: number
}
