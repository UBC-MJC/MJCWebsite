import { describe, it, expect, beforeEach, vi } from "vitest";
import prisma from "../../db";
import {
    checkInPlayer,
    checkOutPlayer,
    getCheckedInPlayers,
    getStatus,
} from "../../services/checkin.service";
import { initialise } from "./util";
vi.mock("@prisma/client");
describe("CheckIn Service Test", () => {
    let initState: Awaited<ReturnType<typeof initialise>>;
    beforeEach(async () => {
        initState = await initialise();
    });
    it("should check in a player", async () => {
        const player = initState.players[0];

        const timeBeforeCheckIn = Date.now();
        const result = await checkInPlayer(player.id);
        const timeAfterCheckIn = Date.now();

        const checkedInAt = result.checkedInAt!.getTime();
        expect(checkedInAt).toBeGreaterThanOrEqual(timeBeforeCheckIn);
        expect(checkedInAt).toBeLessThanOrEqual(timeAfterCheckIn);
    });
    it("should check out a player", async () => {
        const player = initState.players[0];

        await checkInPlayer(player.id);
        const result = await checkOutPlayer(player.id);

        expect(result.checkedInAt).toBeNull();
    });
    it("should only obtain check-in status of active player", async () => {
        const activePlayer = initState.players[0];
        const expiredPlayer = initState.players[1];
        const newPlayer = initState.players[2];

        await prisma.player.update({
            where: {
                id: activePlayer.id,
            },
            data: {
                checkedInAt: new Date(
                    Date.now() - 7.999 * 60 * 60 * 1000,
                ),
            },
        });
        await prisma.player.update({
            where: {
                id: expiredPlayer.id,
            },
            data: {
                checkedInAt: new Date(
                    Date.now() - 8.001 * 60 * 60 * 1000,
                ),
            },
        });
        const activeStatus = await getStatus(activePlayer.id);
        const expiredStatus = await getStatus(expiredPlayer.id);
        const noStatus = await getStatus(newPlayer.id);
        expect(activeStatus).not.toBeNull();
        expect(expiredStatus).toBeNull();
        expect(noStatus).toBeNull();
    });
    it("should return players with active check-ins", async () => {
        const activePlayer = initState.players[0];
        const expiredPlayer = initState.players[1];
        const newPlayer = initState.players[2];

        await prisma.player.update({
            where: {
                id: activePlayer.id,
            },
            data: {
                checkedInAt: new Date(
                    Date.now() - 7.999 * 60 * 60 * 1000,
                ),
            },
        });
        await prisma.player.update({
            where: {
                id: expiredPlayer.id,
            },
            data: {
                checkedInAt: new Date(
                    Date.now() - 8.001 * 60 * 60 * 1000,
                ),
            },
        });

        const players = await getCheckedInPlayers();
        expect(players.some((p) => p.id === activePlayer.id)).toBe(true);
        expect(players.some((p) => p.id === expiredPlayer.id)).toBe(false);
        expect(players.some((p) => p.id === newPlayer.id)).toBe(false);
    });
})