import prisma from "../../db";
import { createSeason } from "../../services/season.service";
import { GameType } from "@prisma/client";
import { GameService } from "../../services/game/game.service";

export async function createTestPlayers() {
    const players = [
        {
            id: "test1",
            firstName: "test1",
            lastName: "test",
            username: "testUser1",
            email: "test1@gmail.com",
            password: "testPassword",
            japaneseQualified: true,
            hongKongQualified: true,
        },
        {
            id: "test2",
            firstName: "test2",
            lastName: "test",
            username: "testUser2",
            email: "test2@gmail.com",
            password: "testPassword",
            japaneseQualified: true,
            hongKongQualified: true,
        },
        {
            id: "test3",
            firstName: "test3",
            lastName: "test",
            username: "testUser3",
            email: "test3@gmail.com",
            password: "testPassword",
            japaneseQualified: true,
            hongKongQualified: true,
        },
        {
            id: "test4",
            firstName: "test4",
            lastName: "test",
            username: "testUser4",
            email: "test4@gmail.com",
            password: "testPassword",
            japaneseQualified: true,
            hongKongQualified: true,
        },
    ];
    return await Promise.all(players.map((player) => prisma.player.create({ data: player })));
}
export async function initialise() {
    const players = await createTestPlayers();
    const season = await createSeason("testSeason", new Date(), new Date());
    return { players, season };
}

export async function initialiseGame(
    gameService: GameService,
    seasonID: string,
    state: any = {},
    playerUsernames: string[] = ["testUser1", "testUser2", "testUser3", "testUser4"],
    recordingPlayerID = "test1",
) {
    const initGame = await gameService.createGame(
        GameType.RANKED,
        playerUsernames,
        recordingPlayerID,
        seasonID,
    );
    return await gameService.updateGame(initGame.id, state);
}
