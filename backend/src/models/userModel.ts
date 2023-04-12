import {OkPacket} from "mysql2"

import {connection} from "../db"
import {IUser} from "../types/user";

export function readAll(): Promise<IUser[]> {
    return new Promise((resolve, reject) => {
        connection.query<IUser[]>("SELECT * FROM users", (err, res) => {
            if (err) reject(err)
            else resolve(res)
        })
    })
}

export function readById(user_id: number): Promise<IUser | undefined> {
    return new Promise((resolve, reject) => {
        connection.query<IUser[]>(
            "SELECT * FROM users WHERE id = ?",
            [user_id],
            (err, res) => {
                if (err) reject(err)
                else resolve(res?.[0])
            }
        )
    })
}

export function create(user: IUser): Promise<IUser> {
    return new Promise((resolve, reject) => {
        connection.query<OkPacket>(
            "INSERT INTO users (email, password, admin) VALUES(?,?,?)",
            [user.email, user.password, user.admin],
            (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    readById(res.insertId)
                        .then(user => resolve(user!))
                        .catch(reject)
                }
            }
        )
    })
}

export function update(user: IUser): Promise<IUser | undefined> {
    return new Promise((resolve, reject) => {
        connection.query<OkPacket>(
            "UPDATE users SET email = ?, password = ?, admin = ? WHERE id = ?",
            [user.email, user.password, user.admin, user.id],
            (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    readById(user.id!)
                        .then(user => resolve(user!))
                        .catch(reject)
                }
            }
        )
    })
}

export function remove(user_id: number): Promise<number> {
    return new Promise((resolve, reject) => {
        connection.query<OkPacket>(
            "DELETE FROM users WHERE id = ?",
            [user_id],
            (err, res) => {
                if (err) reject(err)
                else resolve(res.affectedRows)
            }
        )
    })
}
