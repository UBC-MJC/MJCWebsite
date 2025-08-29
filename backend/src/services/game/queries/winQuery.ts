import { Prisma } from "@prisma/client";

export function winQuery(seasonId, playerId) {
    return Prisma.sql`
     SELECT SUM(winPoint) as winPoint, 
             SUM(riichiCount) as riichiCount, 
             SUM(count) as count
     FROM (
          SELECT SUM(CASE pg.wind
                         WHEN 'EAST' THEN t.player0ScoreChange
                         WHEN 'SOUTH' THEN t.player1ScoreChange
                         WHEN 'WEST' THEN t.player2ScoreChange
                         WHEN 'NORTH' THEN t.player3ScoreChange
                    END) as winPoint,
                  SUM(CASE pg.wind
                         WHEN 'EAST' THEN r.player0Riichi
                         WHEN 'SOUTH' THEN r.player1Riichi
                         WHEN 'WEST' THEN r.player2Riichi
                         WHEN 'NORTH' THEN r.player3Riichi
                    END) as riichiCount,
                  COUNT(r.id) as count
          FROM JapaneseTransaction t
          JOIN JapaneseRound r ON r.id = t.roundId
          JOIN JapanesePlayerGame pg ON pg.gameId = r.gameId
          JOIN JapaneseGame g ON pg.gameId = g.id
          WHERE g.seasonId = ${seasonId}
               AND pg.playerId = ${playerId}
               AND (
                    (pg.wind = 'EAST' AND t.player0ScoreChange > 0) OR
                    (pg.wind = 'SOUTH' AND t.player1ScoreChange > 0) OR
                    (pg.wind = 'WEST' AND t.player2ScoreChange > 0) OR
                    (pg.wind = 'NORTH' AND t.player3ScoreChange > 0)
               )
     ) WINS
`;
}
