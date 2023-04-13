interface IGame {
    game_id: number
    created_at: string
}

interface GameProps {
    game: IGame
}

type GameTypeProp = {
    gameType: "jp" | "hk"
}

type ApiDataType = {
    message: string
    status: string
    games: IGame[]
    insertId?: number
}

type LoginDataType = {
    username: string
    password: string
}

type SignUpDataType = {
    username: string
    email: string
    firstName: string
    lastName: string
    password: string
}
