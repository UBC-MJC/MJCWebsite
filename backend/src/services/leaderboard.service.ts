import prisma from "../db";

const getAllPlayerElos = async (gameVariant: string, seasonId: string): Promise<any[]> => {
    if (gameVariant === "jp") {
        return getAllJapanesePlayerElos(seasonId);
    } else if (gameVariant === "hk") {
        return getAllHongKongPlayerElos(seasonId);
    }
    throw new Error(`Invalid game variant ${gameVariant}`);
};

const getAllJapanesePlayerElos = async (seasonId: string): Promise<any[]> => {
    return prisma.$queryRaw`SELECT sum(gp.eloChange) as elo, count(gp.eloChange) as gameCount, p.id, p.username
                            FROM JapaneseGame g
                            LEFT JOIN JapanesePlayerGame gp
                                ON g.id = gp.gameId
                            LEFT JOIN Player p
                                ON gp.playerId = p.id
                            WHERE g.seasonId = ${seasonId} AND g.status = ${"FINISHED"} AND g.type = ${"RANKED"}
                            GROUP BY playerId
                            ORDER BY elo DESC;` as Promise<any[]>;
};

const getAllHongKongPlayerElos = async (seasonId: string): Promise<any[]> => {
    return prisma.$queryRaw`SELECT sum(gp.eloChange) as elo, count(gp.eloChange) as gameCount, p.id, p.username
                            FROM HongKongGame g 
                            LEFT JOIN HongKongPlayerGame gp 
                                ON g.id = gp.gameId 
                            LEFT JOIN Player p 
                                ON gp.playerId = p.id
                            WHERE g.seasonId = ${seasonId} AND g.status = ${"FINISHED"} AND g.type = ${"RANKED"}
                            GROUP BY playerId
                            ORDER BY elo DESC;` as Promise<any[]>;
};

export { getAllPlayerElos };
