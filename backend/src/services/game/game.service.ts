import { GameType } from "@prisma/client";

abstract class GameService {
    abstract createGame(
        gameType: GameType,
        players: any[],
        recorderId: string,
        seasonId: string,
    ): Promise<any>;
    abstract getGame(id: number): Promise<any>;
    abstract getCurrentGames(): Promise<any[]>;
    abstract deleteGame(id: number): Promise<void>;
    abstract submitGame(game: any): Promise<void>;
    abstract createRound(game: any, roundRequest: any): Promise<void>;
    abstract deleteRound(id: string): Promise<void>;
    abstract mapGameObject(game: any): any;
}

export default GameService;
