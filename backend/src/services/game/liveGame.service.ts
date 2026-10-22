import { Request, Response } from "express";

// In production nginx closes a response after 60s without data, and Cloudflare after about 100s.
// A round takes minutes, so keep the stream busy with a comment line, which EventSource ignores.
const HEARTBEAT_INTERVAL_MS = 25_000;
// How long a spectator's browser waits before reconnecting after the stream drops.
const RECONNECT_DELAY_MS = 5_000;

type ClientListenerMap = Record<string, Response[]>;

const gameClients: ClientListenerMap = {};

const hashGameKey = (gameId: number, gameVariant: string): string => {
    return `${gameVariant}-${gameId}`;
};

const removeClient = (gameKey: string, response: Response) => {
    gameClients[gameKey] = gameClients[gameKey].filter((client) => client !== response);
};

const addGameListener = (
    req: Request,
    res: Response,
    gameResult: any,
    gameVariant: string,
): void => {
    const headers = {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
        // Keeps nginx from buffering the stream even if proxy_buffering is turned back on.
        "X-Accel-Buffering": "no",
    };
    res.writeHead(200, headers);

    // Every connection starts with the whole game, so a spectator who reconnects catches up on
    // anything they missed while disconnected.
    const data = `retry: ${RECONNECT_DELAY_MS}\ndata: ${JSON.stringify(gameResult)}\n\n`;
    res.write(data);

    const heartbeat = setInterval(() => {
        res.write(": heartbeat\n\n");
    }, HEARTBEAT_INTERVAL_MS);

    const gameKey = hashGameKey(gameResult.id, gameVariant);
    if (!gameClients[gameKey]) {
        gameClients[gameKey] = [res];
    } else {
        gameClients[gameKey].push(res);
    }

    req.on("close", () => {
        clearInterval(heartbeat);
        removeClient(gameKey, res);
    });
};

const sendGameUpdate = (gameResult: any, gameVariant: string): void => {
    const gameKey = hashGameKey(gameResult.id, gameVariant);
    const gameClientList = gameClients[gameKey];
    if (gameClientList) {
        const data = `data: ${JSON.stringify(gameResult)}\n\n`;
        gameClientList.forEach((client) => {
            client.write(data);
        });
    }
};

export { addGameListener, sendGameUpdate };
