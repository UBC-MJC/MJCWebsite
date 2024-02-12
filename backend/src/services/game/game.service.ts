import { GameType } from "@prisma/client";
import { GameFilterArgs } from "./game.util";

abstract class GameService {
    abstract createGame(
        gameType: GameType,
        players: any[],
        recorderId: string,
        seasonId: string,
    ): Promise<any>;
    abstract getGame(id: number): Promise<any>;
    abstract getGames(filter: GameFilterArgs): Promise<any[]>;
    abstract deleteGame(id: number): Promise<void>;
    abstract submitGame(game: any): Promise<void>;
    abstract createRound(game: any, roundRequest: any): Promise<void>;
    abstract deleteRound(id: string): Promise<void>;
    abstract mapGameObject(game: any): Promise<any>;
}

export default GameService;
