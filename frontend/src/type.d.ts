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

type RegisterDataType = {
    username: string
    email: string
    firstName: string
    lastName: string
    password: string
}

type PlayerAPIDataType = {
    accessToken: string
    player: IPlayer
}

interface IPlayer {
    id: string
    username: string
    email: string
    firstName?: string
    lastName?: string
    admin: boolean
    rankedRiichi: boolean
    rankedHongKong: boolean
    createdAt: string
}

type AuthContextType = {
    player: IPlayer | undefined
    login: (loginData: LoginDataType) => Promise<void>;
    register: (registerData: RegisterDataType) => Promise<void>;
    logout: () => Promise<void>;
};
