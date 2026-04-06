import { Prisma } from "@prisma/client";

export function dealInQuery(seasonId, playerId) {
    return Prisma.sql`
 SELECT 
    SUM(CASE pg.wind
        WHEN 'EAST' THEN -t.player0ScoreChange
        WHEN 'SOUTH' THEN -t.player1ScoreChange
        WHEN 'WEST' THEN -t.player2ScoreChange
        WHEN 'NORTH' THEN -t.player3ScoreChange
    END) AS dealInPoint,
    
    SUM(CASE pg.wind
        WHEN 'EAST' THEN player0Riichi
        WHEN 'SOUTH' THEN player1Riichi
        WHEN 'WEST' THEN player2Riichi
        WHEN 'NORTH' THEN player3Riichi
    END) AS riichiCount,
    
    COUNT(r.id) AS count
FROM JapaneseTransaction t
JOIN JapaneseRound r ON r.id = t.roundId
JOIN JapanesePlayerGame pg ON pg.gameId = r.gameId
JOIN JapaneseGame g ON pg.gameId = g.id
WHERE t.transactionType IN ('DEAL_IN', 'DEAL_IN_PAO')
  AND (${seasonId} = '' OR g.seasonId = ${seasonId} )
  AND pg.playerId = ${playerId}
  AND (
      (pg.wind = 'EAST' AND t.player0ScoreChange < 0 AND (t.paoPlayerIndex IS NULL OR t.paoPlayerIndex != 0)) OR
      (pg.wind = 'SOUTH' AND t.player1ScoreChange < 0 AND (t.paoPlayerIndex IS NULL OR t.paoPlayerIndex != 1)) OR
      (pg.wind = 'WEST' AND t.player2ScoreChange < 0 AND (t.paoPlayerIndex IS NULL OR t.paoPlayerIndex != 2)) OR
      (pg.wind = 'NORTH' AND t.player3ScoreChange < 0 AND (t.paoPlayerIndex IS NULL OR t.paoPlayerIndex != 3))
  )
    `;
}
