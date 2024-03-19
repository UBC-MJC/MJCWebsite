import { Request, Response } from "express";

type ClientListener = {
    clientId: number;
    response: Response;
};

type ClientListenerMap = {
    [key: string]: ClientListener[];
};

const gameClients: ClientListenerMap = {};

const hashGameKey = (gameId: number, gameVariant: string): string => {
    return `${gameVariant}-${gameId}`;
};

const removeClient = (gameId: string, clientId: number) => {
    const gameClientList = gameClients[gameId];
    gameClients[gameId] = gameClientList.filter((client) => client.clientId !== clientId);
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
    };
    res.writeHead(200, headers);

    const data = `data: ${JSON.stringify(gameResult)}\n\n`;
    res.write(data);

    const clientId = Date.now();
    const newClient = {
        clientId: clientId,
        response: res,
    };

    const gameKey = hashGameKey(gameResult.id, gameVariant);
    if (!gameClients[gameKey]) {
        gameClients[gameKey] = [newClient];
    } else {
        gameClients[gameKey].push(newClient);
    }

    req.on("close", () => {
        removeClient(gameKey, clientId);
    });
};

const sendGameUpdate = (gameResult: any, gameVariant: string): void => {
    const gameKey = hashGameKey(gameResult.id, gameVariant);
    const gameClientList = gameClients[gameKey];
    if (gameClientList) {
        const data = `data: ${JSON.stringify(gameResult)}\n\n`;
        gameClientList.forEach((client) => {
            client.response.write(data);
        });
    }
};

export { addGameListener, sendGameUpdate };
