import { GameType } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
    createSeason,
    findCurrentSeason,
    findSeason,
    getCurrentSeasons,
} from "../../services/season.service";

vi.mock("@prisma/client");

describe("season service", () => {
    const now = new Date("2026-09-06T12:00:00Z");

    beforeAll(() => {
        vi.useFakeTimers();
        vi.setSystemTime(now);
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    it("returns only active seasons and can filter them by type", async () => {
        const ranked = await createSeason(
            "Ranked",
            GameType.RANKED,
            new Date("2026-09-01T00:00:00Z"),
            new Date("2026-09-10T00:00:00Z"),
        );
        const casual = await createSeason(
            "Casual",
            GameType.CASUAL,
            new Date("2026-09-01T00:00:00Z"),
            new Date("2026-09-20T00:00:00Z"),
        );
        await createSeason(
            "Expired",
            GameType.RANKED,
            new Date("2026-08-01T00:00:00Z"),
            new Date("2026-09-01T00:00:00Z"),
        );
        await createSeason(
            "Future",
            GameType.RANKED,
            new Date("2026-09-07T00:00:00Z"),
            new Date("2026-09-30T00:00:00Z"),
        );

        const currentSeasonIds = (await getCurrentSeasons()).map((season) => season.id);
        expect(currentSeasonIds).toHaveLength(2);
        expect(currentSeasonIds).toEqual(expect.arrayContaining([casual.id, ranked.id]));
        expect(await findCurrentSeason(GameType.RANKED)).toMatchObject({ id: ranked.id });
        expect(await findSeason(casual.id)).toMatchObject({ type: GameType.CASUAL });
    });
});
