import { EventEmitter } from "events";
import { Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addGameListener, sendGameUpdate } from "../../services/game/liveGame.service";

function createSpectator() {
    const request = new EventEmitter() as unknown as Request;
    const writeHead = vi.fn();
    const write = vi.fn();
    const response = { writeHead, write } as unknown as Response;
    return { request, response, writeHead, write };
}

describe("liveGame.service", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("starts the stream with the reconnect delay and the whole game", () => {
        const spectator = createSpectator();

        addGameListener(spectator.request, spectator.response, { id: 1 }, "jp");

        expect(spectator.writeHead).toHaveBeenCalledWith(
            200,
            expect.objectContaining({ "Content-Type": "text/event-stream" }),
        );
        expect(spectator.write).toHaveBeenCalledWith('retry: 5000\ndata: {"id":1}\n\n');
        spectator.request.emit("close");
    });

    it("sends heartbeats more often than the 60 second proxy idle timeout", () => {
        const spectator = createSpectator();
        addGameListener(spectator.request, spectator.response, { id: 2 }, "jp");
        spectator.write.mockClear();

        vi.advanceTimersByTime(59_999);
        expect(spectator.write).toHaveBeenCalledTimes(2);
        expect(spectator.write).toHaveBeenCalledWith(": heartbeat\n\n");
        spectator.request.emit("close");
    });

    it("stops writing to a spectator who disconnects", () => {
        const spectator = createSpectator();
        addGameListener(spectator.request, spectator.response, { id: 3 }, "jp");
        spectator.request.emit("close");
        spectator.write.mockClear();

        vi.advanceTimersByTime(60_000);
        sendGameUpdate({ id: 3 }, "jp");

        expect(spectator.write).not.toHaveBeenCalled();
    });

    it("keeps updating a spectator when one who joined in the same millisecond leaves", () => {
        const leaving = createSpectator();
        const staying = createSpectator();
        addGameListener(leaving.request, leaving.response, { id: 4 }, "jp");
        addGameListener(staying.request, staying.response, { id: 4 }, "jp");

        leaving.request.emit("close");
        leaving.write.mockClear();
        sendGameUpdate({ id: 4, status: "FINISHED" }, "jp");

        expect(staying.write).toHaveBeenLastCalledWith('data: {"id":4,"status":"FINISHED"}\n\n');
        expect(leaving.write).not.toHaveBeenCalled();
        staying.request.emit("close");
    });

    it("only updates spectators of the same game and variant", () => {
        const watching = createSpectator();
        const otherVariant = createSpectator();
        const otherGame = createSpectator();
        addGameListener(watching.request, watching.response, { id: 5 }, "jp");
        addGameListener(otherVariant.request, otherVariant.response, { id: 5 }, "hk");
        addGameListener(otherGame.request, otherGame.response, { id: 6 }, "jp");
        [watching, otherVariant, otherGame].forEach((spectator) => spectator.write.mockClear());

        sendGameUpdate({ id: 5 }, "jp");

        expect(watching.write).toHaveBeenCalledWith('data: {"id":5}\n\n');
        expect(otherVariant.write).not.toHaveBeenCalled();
        expect(otherGame.write).not.toHaveBeenCalled();
        [watching, otherVariant, otherGame].forEach((spectator) => spectator.request.emit("close"));
    });
});
