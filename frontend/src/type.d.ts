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
    player: IPlayer
}

interface IPlayer {
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

interface ISeason {
    id: number
    name: string
    startDate: string
    endDate?: string
}

type AuthContextType = {
    player: IPlayer | undefined
    login: (loginData: LoginDataType) => Promise<void>;
    register: (registerData: RegisterDataType) => Promise<void>;
    logout: () => Promise<void>;
};
