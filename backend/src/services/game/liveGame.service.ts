import { Request, Response } from "express";

const HEARTBEAT_INTERVAL_MS = 25_000;
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
        "X-Accel-Buffering": "no",
    };
    res.writeHead(200, headers);

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
