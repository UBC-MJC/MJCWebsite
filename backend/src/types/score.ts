import {RowDataPacket} from "mysql2"

export interface IScore extends RowDataPacket {
    score_id: number
    round_id: number
    player_id: number
    score_value: number
}
