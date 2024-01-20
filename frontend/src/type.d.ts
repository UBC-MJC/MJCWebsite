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
    rounds: (JapaneseRound | HongKongRound)[];
    currentRound?: PartialJapaneseRound;
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

type JapaneseRound = {
    id?: string;
    roundNumber: number;
    roundWind: string;
    roundCount: number;
    bonus: number;
    startRiichiStickCount: number;
    endRiichiStickCount: number;
    riichis: number[];
    tenpais: number[];
    transactions: JapaneseTransaction[];
};

type PartialJapaneseRound = Pick<JapaneseRound, "roundCount" | "roundNumber" | "roundWind" | "bonus" | "startRiichiStickCount">;

type JapaneseTransaction = {
    id?: string;
    transactionType: JapaneseTransactionType;
    scoreDeltas: number[];
    hand?: JapaneseHandInput;
    paoPlayerIndex?: number;
};

type Transaction = JapaneseTransaction | HongKongTransaction

type JapaneseTransactionType = "DEAL_IN" | "SELF_DRAW" | "DEAL_IN_PAO" | "SELF_DRAW_PAO" | "NAGASHI_MANGAN" | "INROUND_RYUUKYOKU";

type JapaneseHandInput = {
    han: number;
    fu: number;
    dora: number;
};


type HongKongRound = {
    id: string;
    roundNumber: number;
    roundWind: string;
    roundCount: number;
    transactions: HongKongTransaction[];
};

type PartialHongKongRound = Pick<HongKongRound, "roundCount" | "roundNumber" | "roundWind">;

type HongKongTransaction = {
    id?: string;
    transactionType: HongKongTransactionType;
    scoreDeltas: number[];
    hand?: HongKongHandInput;
    paoPlayerIndex?: number;
};

type HongKongHandInput = number

enum HongKongTransactionType {
    DEAL_IN = "DEAL_IN",
    SELF_DRAW = "SELF_DRAW",
    DEAL_IN_PAO = "DEAL_IN_PAO",
    SELF_DRAW_PAO = "SELF_DRAW_PAO",
    RESHUFFLE = "RESHUFFLE"
}