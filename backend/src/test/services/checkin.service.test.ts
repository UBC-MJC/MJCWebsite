import { describe, it, expect, beforeEach, vi } from "vitest";
import prisma from "../../db";
import {
    checkInPlayer,
    checkOutPlayer,
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
    it("should expire check-ins after 8 hours", async () => {
        const expiredAt = new Date(Date.now() - 8.001 * 60 * 60 * 1000);
        const player = initState.players[0];

        await prisma.player.update({
            where: {
                id: player.id,
            },
            data: {
                checkedInAt: expiredAt,
            },
        });

        const status = await getStatus(player.id);
        expect(status).toBeNull();
    });
    it("should keep check-ins within 8 hours", async () => {
        const activeAt = new Date(Date.now() - 7.999 * 60 * 60 * 1000);
        const player = initState.players[0];

        await prisma.player.update({
            where: {
                id: player.id,
            },
            data: {
                checkedInAt: activeAt,
            },
        });

        const status = await getStatus(player.id);
        expect(status).not.toBeNull();
    });
})