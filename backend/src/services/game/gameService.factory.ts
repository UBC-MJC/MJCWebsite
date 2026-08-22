import {
    ConcludedHongKongRoundSchema,
    ConcludedJapaneseRoundSchema,
    GameVariant,
} from "../../validation/game.validation";
import type { GameService } from "./game.service";
import { HongKongGameService } from "./hongKongGame.service";
import { JapaneseGameService } from "./japaneseGame.service";

const gameServiceFactories = {
    jp: () => new JapaneseGameService(),
    hk: () => new HongKongGameService(),
} satisfies Record<GameVariant, () => GameService>;

export function getGameService(gameVariant: GameVariant): GameService {
    return gameServiceFactories[gameVariant]();
}

export async function createRoundForVariant(
    gameVariant: GameVariant,
    game: { id: number },
    roundRequest: unknown,
): Promise<void> {
    switch (gameVariant) {
        case "jp": {
            const concludedRound = ConcludedJapaneseRoundSchema.parse(roundRequest);
            await gameServiceFactories.jp().createRound(game, concludedRound);
            return;
        }
        case "hk": {
            const concludedRound = ConcludedHongKongRoundSchema.parse(roundRequest);
            await gameServiceFactories.hk().createRound(game, concludedRound);
            return;
        }
        default:
            return assertNever(gameVariant);
    }
}

function assertNever(value: never): never {
    throw new Error(`Unsupported game variant: ${String(value)}`);
}
