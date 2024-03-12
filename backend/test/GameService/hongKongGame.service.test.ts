import { it, describe, expect } from "vitest";
import { getGameService } from "../../src/services/game/game.util";
import prisma from "../../src/db";
import { testGameServiceCommon } from "./game.service.test.common";

describe("Japanese Game Service Tests", async () => {
    it("should initialize properly", () => {
        const hongKongGameService = getGameService("hk");
        expect(hongKongGameService.playerGameDatabase).equal(prisma.hongKongPlayerGame);
        expect(hongKongGameService.gameDatabase).equal(prisma.hongKongGame);
    });
});
testGameServiceCommon("hk");
