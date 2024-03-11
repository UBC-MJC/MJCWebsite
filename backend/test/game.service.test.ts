import { beforeEach, describe, expect } from "vitest";
import { getGameService } from "../src/services/game/game.util";
import { createPlayer } from "../src/services/player.service";

describe("Game Service Test", async () => {
    let user1, user2, user3, user4;
    beforeEach(async () => {
        user1 = await createPlayer({
            firstName: "test",
            lastName: "test2",
            username: "testUser1",
            email: "bruh@gmail.com",
            password: "testPassword",
        });
        user2 = await createPlayer({
            firstName: "test",
            lastName: "test2",
            username: "testUser2",
            email: "bruh@gmail.com",
            password: "testPassword",
        });
        user3 = await createPlayer({
            firstName: "test",
            lastName: "test2",
            username: "testUser3",
            email: "bruh@gmail.com",
            password: "testPassword",
        });
        user4 = await createPlayer({
            firstName: "test",
            lastName: "test2",
            username: "testUser4",
            email: "bruh@gmail.com",
            password: "testPassword",
        });
    })
    const japaneseGameService = getGameService("jp");
    const game = await japaneseGameService.createGame(
        "RANKED",
        [user1.id, user2.id, user3.id, user4.id],
        user1.id,
        "season",
    );
    expect(game).equals({});
    expect(japaneseGameService).not.null;
});
