import { OkPacket } from "mysql2"

import { connection } from "../db"
import { IGame } from "../types/game";

export function readAll(): Promise<IGame[]> {
    return new Promise((resolve, reject) => {
        connection.query<IGame[]>("SELECT * FROM games", (err, res) => {
            if (err) reject(err)
            else resolve(res)
        })
    })
}

export function readById(user_id: number): Promise<IGame | undefined> {
    return new Promise((resolve, reject) => {
        connection.query<IGame[]>(
            "SELECT * FROM games WHERE id = ?",
            [user_id],
            (err, res) => {
                if (err) reject(err)
                else resolve(res?.[0])
            }
        )
    })
}

export function create(): Promise<number> {
    return new Promise((resolve, reject) => {
        connection.query(
            "INSERT INTO games (created_at) VALUES(NOW())",
            (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    const insertId = (<OkPacket> res).insertId;
                    resolve(insertId)
                }
            }
        )
    })
}
