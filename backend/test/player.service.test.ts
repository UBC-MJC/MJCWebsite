import { expect, test } from "vitest";
import { createPlayer, updatePlayer } from "../src/services/player.service";

test("Player Service Test", async () => {
    const player = await createPlayer({
        firstName: "test",
        lastName: "test2",
        username: "testAccount",
        email: "bruh@gmail.com",
        password: "testPassword",
    });
    expect(player).toMatchObject({
        admin: false,
        email: "bruh@gmail.com",
        firstName: "test",
        hongKongQualified: false,
        japaneseQualified: false,
        lastName: "test2",
        legacyDisplayGame: false,
        username: "testAccount",
    });
    const updatedPlayer = await updatePlayer(player.id, {
        admin: true,
        japaneseQualified: true,
        hongKongQualified: true,
    })
    expect(updatedPlayer).toMatchObject({
        admin: true,
        email: "bruh@gmail.com",
        firstName: "test",
        hongKongQualified: true,
        japaneseQualified: true,
        lastName: "test2",
        legacyDisplayGame: false,
        username: "testAccount",
    });
});
