import { Prisma } from "@prisma/client";

export function roundQuery(seasonId, playerId) {
    return Prisma.sql`
     SELECT SUM(
          CASE pg.wind 
               WHEN 'EAST' THEN r.player0Riichi
               WHEN 'SOUTH' THEN r.player1Riichi
               WHEN 'WEST' THEN r.player2Riichi
               WHEN 'NORTH' THEN r.player3Riichi
          END
     ) as riichiCount
     FROM JapaneseRound r
     JOIN JapanesePlayerGame pg ON pg.gameId = r.gameId
     JOIN JapaneseGame g ON g.id = pg.gameId
     WHERE g.seasonId = ${seasonId}
     AND pg.playerId = ${playerId}
`;
}
