type LeaderboardType = {
    username: string;
    elo: string;
    gameCount: string;
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

type GameType = "RANKED" | "PLAY_OFF" | "TOURNEY" | "CASUAL";

type GameVariant = "jp" | "hk";

type GameCreationProp = {
    season: Season;
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

type ResetPasswordDataType = {
    email: string;
};

type PlayerAPIDataType = {
    player: Player;
};

type PlayerNamesDataType = {
    playerId: string;
    username: string;
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
    gameType: GameType;
    startDate: string;
    endDate: string;
};

type SeasonsAPIDataType = Season[];

type AuthContextType = {
    player: Player | undefined;
    login: (loginData: LoginDataType) => Promise<void>;
    register: (registerData: RegisterDataType) => Promise<void>;
    logout: () => Promise<void>;
    reloadPlayer: () => Promise<void>;
};

type Game = {
    id: string;
    type: GameType;
    gameVariant: GameVariant;
    status: string;
    recordedById: string;
    createdAt: string;
    players: GamePlayer[];
    rounds: (JapaneseRound | HongKongRound)[];
    eloDeltas: EloDeltaObject;
    currentRound: PartialJapaneseRound;
};

type EloDeltaObject = {
    [key: string]: number;
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

type PartialJapaneseRound = Pick<
    JapaneseRound,
    "roundCount" | "roundNumber" | "roundWind" | "bonus" | "startRiichiStickCount"
>;

type JapaneseTransaction = {
    transactionType: JapaneseTransactionType;
    scoreDeltas: number[];
    hand?: JapaneseHandInput;
    paoPlayerIndex?: number;
};

type Transaction = JapaneseTransaction | HongKongTransaction;

type JapaneseTransactionType =
    | "DEAL_IN"
    | "SELF_DRAW"
    | "DEAL_IN_PAO"
    | "SELF_DRAW_PAO"
    | "NAGASHI_MANGAN"
    | "INROUND_RYUUKYOKU";

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
};

type HongKongHandInput = number;

type HongKongTransactionType =
    | "DEAL_IN"
    | "SELF_DRAW"
    | "DEAL_IN_PAO"
    | "SELF_DRAW_PAO"
    | "RESHUFFLE";

type OptionsType<T> = {
    label: string;
    value: T;
};

type StatisticsType = {
    totalRounds: number;
    dealInCount: number;
    dealInPoint: number;
    winCount: number;
    winPoint: number;
};
