export interface LeaderboardType {
    id: string;
    username: string;
    elo: string;
    gameCount: string;
    chomboCount: number;
}

export interface Setting {
    legacyDisplayGame: boolean;
}

export interface GamePlayer {
    id: string;
    username: string;
    trueWind: string;
    score: number;
}

export type GameType = "RANKED" | "PLAY_OFF" | "TOURNEY" | "CASUAL";

export type GameVariant = "jp" | "hk";

export interface GameCreationProp {
    gameVariant: GameVariant;
    gameType: GameType;
}

export interface LoginDataType {
    username: string;
    password: string;
}

export interface RegisterDataType {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
}

export interface ResetPasswordDataType {
    email: string;
}

export interface PlayerAPIDataType {
    player: Player;
}

export interface PlayerNamesDataType {
    playerId: string;
    username: string;
}

export interface Player {
    id: string;
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

export interface Season {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
}

export type SeasonsAPIDataType = Season[];

export interface AuthContextType {
    player: Player | undefined;
    login: (loginData: LoginDataType) => Promise<void>;
    register: (registerData: RegisterDataType) => Promise<void>;
    logout: () => Promise<void>;
    reloadPlayer: () => Promise<void>;
}

export interface Game<T extends GameVariant> {
    id: string;
    type: GameType;
    status: string;
    recordedById: string;
    createdAt: string;
    players: GamePlayer[];
    rounds: RoundByVariant<T>[];
    eloDeltas: EloDeltaObject;
    currentRound: PartialRoundByVariant<T>;
}

export type RoundByVariant<T extends GameVariant> = T extends "jp" ? JapaneseRound : HongKongRound;
export type PartialRoundByVariant<T extends GameVariant> = T extends "jp"
    ? PartialJapaneseRound
    : PartialHongKongRound;
export type EloDeltaObject = Record<string, number>;

export interface RoundType {
    name: string;
    value: string;
    selectors?: string[];
}

export type PlayerActions = Record<string, string[]>;

export interface RoundValue {
    type: RoundType;
    playerActions: PlayerActions;
}

export interface JapaneseRound {
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

export type PartialJapaneseRound = Pick<
    JapaneseRound,
    "roundCount" | "roundNumber" | "roundWind" | "bonus" | "startRiichiStickCount"
>;

export interface JapaneseTransaction {
    transactionType: JapaneseTransactionType;
    scoreDeltas: number[];
    hand?: JapaneseHandInput;
    paoPlayerIndex?: number;
}

export type Transaction = JapaneseTransaction | HongKongTransaction;

export type JapaneseTransactionType =
    | "DEAL_IN"
    | "SELF_DRAW"
    | "DEAL_IN_PAO"
    | "SELF_DRAW_PAO"
    | "NAGASHI_MANGAN"
    | "INROUND_RYUUKYOKU";

export interface JapaneseHandInput {
    han: number;
    fu: number;
    dora: number;
}

export interface HongKongRound {
    id?: string;
    roundNumber: number;
    roundWind: string;
    roundCount: number;
    transactions: HongKongTransaction[];
}

export type PartialHongKongRound = Pick<HongKongRound, "roundCount" | "roundNumber" | "roundWind">;

export interface HongKongTransaction {
    id?: string;
    transactionType: HongKongTransactionType;
    scoreDeltas: number[];
    hand?: HongKongHandInput;
}

export type HongKongHandInput = number;

export type HongKongTransactionType =
    | "DEAL_IN"
    | "SELF_DRAW"
    | "DEAL_IN_PAO"
    | "SELF_DRAW_PAO"
    | "RESHUFFLE";

export interface OptionsType<T> {
    label: string;
    value: T;
}

export interface StatisticsType {
    totalRounds: number;
    dealInCount: number;
    dealInPoint: number;
    winCount: number;
    winPoint: number;
}
