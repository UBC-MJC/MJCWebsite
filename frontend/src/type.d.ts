interface IGame {
    game_id: number
    created_at: string
}

interface GameProps {
    game: IGame
}

type ApiDataType = {
    message: string
    status: string
    games: IGame[]
    insertId?: number
}

type loginDataType = {
    username: string
    password: string
}

type signUpDataType = {
    username: string
    email: string
    firstName: string
    lastName: string
    password: string
}
