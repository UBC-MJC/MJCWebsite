interface IGame {
    game_id: number
    created_at: string
}

interface GameProps {
    game: IGame
}

type GameVariant  = "JAPANESE" | "HONG_KONG"

type GameType = "RANKED" | "PLAY_OFF" | "TOURNEY"

type GameTypeProp = {
    gameVariant: "jp" | "hk"
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
    player: Player
}

type Player = {
    id: string
    authToken: string
    username: string
    email: string
    firstName?: string
    lastName?: string
    admin: boolean
    japaneseQualified: boolean
    hongKongQualified: boolean
    createdAt: string
}

type Season = {
    id: string
    name: string
    startDate: string
    endDate: string
}

type AuthContextType = {
    player: Player | undefined
    login: (loginData: LoginDataType) => Promise<void>;
    register: (registerData: RegisterDataType) => Promise<void>;
    logout: () => Promise<void>;
};

type Game = {
    id: string
    gameType: GameType
    gameVariant: GameVariant
    status: string
    recordedById: string
    players: any[]
    rounds: any[]
}
