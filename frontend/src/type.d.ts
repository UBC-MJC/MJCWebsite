interface LeaderboardType {
    username: string;
    elo: string;
    gameCount: string;
}

interface Setting {
    legacyDisplayGame: boolean;
}

interface GamePlayer {
    id: string;
    username: string;
    trueWind: string;
    score: number;
}

type GameType = "RANKED" | "PLAY_OFF" | "TOURNEY" | "CASUAL";

type GameVariant = "jp" | "hk";

interface GameCreationProp {
    gameVariant: GameVariant;
    gameType: GameType;
}

interface LoginDataType {
    username: string;
    password: string;
}

interface RegisterDataType {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
}

interface ResetPasswordDataType {
    email: string;
}

interface PlayerAPIDataType {
    player: Player;
}

interface PlayerNamesDataType {
    playerId: string;
    username: string;
}

interface Player {
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
}

interface Season {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
}

type SeasonsAPIDataType = Season[];

interface AuthContextType {
    player: Player | undefined;
    login: (loginData: LoginDataType) => Promise<void>;
    register: (registerData: RegisterDataType) => Promise<void>;
    logout: () => Promise<void>;
    reloadPlayer: () => Promise<void>;
}

interface Game {
    id: string;
    type: GameType;
    status: string;
    recordedById: string;
    createdAt: string;
    players: GamePlayer[];
    rounds: (JapaneseRound | HongKongRound)[];
    eloDeltas: EloDeltaObject;
    currentRound: PartialJapaneseRound;
}

type EloDeltaObject = Record<string, number>;

interface RoundType {
    name: string;
    value: string;
    selectors: string[];
}

type PlayerActions = Record<string, string[]>;

interface RoundValue {
    type: RoundType;
    playerActions: PlayerActions;
}

interface JapaneseRound {
    roundNumber: number;
    roundWind: string;
    roundCount: number;
    bonus: number;
    startRiichiStickCount: number;
    endRiichiStickCount: number;
    riichis: number[];
    tenpais: number[];
    transactions: JapaneseTransaction[];
}

type PartialJapaneseRound = Pick<
    JapaneseRound,
    "roundCount" | "roundNumber" | "roundWind" | "bonus" | "startRiichiStickCount"
>;

interface JapaneseTransaction {
    transactionType: JapaneseTransactionType;
    scoreDeltas: number[];
    hand?: JapaneseHandInput;
    paoPlayerIndex?: number;
}

type Transaction = JapaneseTransaction | HongKongTransaction;

type JapaneseTransactionType =
    | "DEAL_IN"
    | "SELF_DRAW"
    | "DEAL_IN_PAO"
    | "SELF_DRAW_PAO"
    | "NAGASHI_MANGAN"
    | "INROUND_RYUUKYOKU";

interface JapaneseHandInput {
    han: number;
    fu: number;
    dora: number;
}

interface HongKongRound {
    id: string;
    roundNumber: number;
    roundWind: string;
    roundCount: number;
    transactions: HongKongTransaction[];
}

type PartialHongKongRound = Pick<HongKongRound, "roundCount" | "roundNumber" | "roundWind">;

interface HongKongTransaction {
    id?: string;
    transactionType: HongKongTransactionType;
    scoreDeltas: number[];
    hand?: HongKongHandInput;
}

type HongKongHandInput = number;

type HongKongTransactionType =
    | "DEAL_IN"
    | "SELF_DRAW"
    | "DEAL_IN_PAO"
    | "SELF_DRAW_PAO"
    | "RESHUFFLE";

interface OptionsType<T> {
    label: string;
    value: T;
}

interface StatisticsType {
    totalRounds: number;
    dealInCount: number;
    dealInPoint: number;
    winCount: number;
    winPoint: number;
}
