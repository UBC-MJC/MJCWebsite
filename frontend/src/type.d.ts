interface IGame {
    game_id: number;
    created_at: string;
}

interface GameProps {
    game: IGame;
}

type GameType = "RANKED" | "PLAY_OFF" | "TOURNEY";

type GameVariant = "jp" | "hk";

type GameTypeProp = {
    gameVariant: GameVariant;
};

type LoginDataType = {
    username: string;
    password: string;
};

type RegisterDataType = {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
};

type PlayerAPIDataType = {
    player: Player;
};

type Player = {
    id: string;
    authToken: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    admin: boolean;
    japaneseQualified: boolean;
    hongKongQualified: boolean;
    createdAt: string;
    legacyDisplayGame: boolean;
};

type Season = {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
};

type AuthContextType = {
    player: Player | undefined;
    login: (loginData: LoginDataType) => Promise<void>;
    register: (registerData: RegisterDataType) => Promise<void>;
    logout: () => Promise<void>;
    reloadPlayer: () => Promise<void>;
};

type Game = {
    id: string;
    gameType: GameType;
    gameVariant: GameVariant;
    status: string;
    recordedById: string;
    players: any[];
    rounds: any[];
    currentRound: any;
    gameOver: boolean;
};

type RoundType = {
    name: string;
    value: string;
    selectors: string[];
};

type PlayerActions = {
    [key: string]: string[];
};

type RoundValue = {
    type: RoundType;
    playerActions: PlayerActions;
};

type LeaderboardType = {
    username: string;
    elo: string;
};

type Setting = {
    legacyDisplayGame: boolean;
};

type GamePlayer = {
    id: string;
    username: string;
    trueWind: string;
    score: number;
};

type JapaneseRound = {
    id: string;
    bonus: number;
    roundCount: number;
    roundNumber: number;
    roundWind: string;
    transactions: JapaneseTransaction[];
};

type JapaneseHand = {
    id: string;
    han: number;
    fu: number;
    honba: number;
    dora: number;
};

type JapaneseScore = {
    id: string;
    scoreChange: number;
    riichi: boolean;
    playerId: string;
};

type JapaneseTransaction = {
    id: string;
    pointReceiverID: string;
    pointGiverID: string;
    amount: number;
    hand?: JapaneseHand;
}