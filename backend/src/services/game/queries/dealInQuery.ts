import { Prisma } from "@prisma/client";

export function dealInQuery(seasonId, playerId) {
    return Prisma.sql`
        select sum(dealInPoint) as dealInPoint, sum(riichiCount) as riichiCount, sum(count) as count
        from (select -sum(t.player0ScoreChange) as dealInPoint,
                     sum(player0Riichi)         as riichiCount,
                     count(r.id)                as count
              from JapaneseTransaction t,
                   JapaneseRound r,
                   JapanesePlayerGame pg,
                   JapaneseGame g
              where pg.gameId = r.gameId
                and r.id = t.roundId
                and t.transactionType in ('DEAL_IN', 'DEAL_IN_PAO')
                and (t.paoPlayerIndex IS NULL or t.paoPlayerIndex != 0)
                and t.player0ScoreChange < 0
                and pg.wind = 'EAST'
                and pg.gameId = g.id
                and g.seasonId = ${seasonId}
                and pg.playerId = ${playerId}
              union all
              select -sum(t.player1ScoreChange) as dealInPoint,
                     sum(player1Riichi)         as riichiCount,
                     count(r.id)                as count
              from JapaneseTransaction t,
                   JapaneseRound r,
                   JapanesePlayerGame pg,
                   JapaneseGame g
              where pg.gameId = r.gameId
                and r.id = t.roundId
                and t.transactionType in ('DEAL_IN', 'DEAL_IN_PAO')
                and (t.paoPlayerIndex IS NULL or t.paoPlayerIndex != 1)
                and t.player1ScoreChange < 0
                and pg.wind = 'SOUTH'
                and pg.gameId = g.id
                and g.seasonId = ${seasonId}
                and pg.playerId = ${playerId}
              union all
              select -sum(t.player2ScoreChange) as dealInPoint,
                     sum(player2Riichi)         as riichiCount,
                     count(r.id)                as count
              from JapaneseTransaction t,
                   JapaneseRound r,
                   JapanesePlayerGame pg,
                   JapaneseGame g
              where pg.gameId = r.gameId
                and r.id = t.roundId
                and t.transactionType in ('DEAL_IN', 'DEAL_IN_PAO')
                and (t.paoPlayerIndex IS NULL or t.paoPlayerIndex != 2)
                and t.player2ScoreChange < 0
                and pg.wind = 'WEST'
                and pg.gameId = g.id
                and g.seasonId = ${seasonId}
                and pg.playerId = ${playerId}
              union all
              select -sum(t.player3ScoreChange) as dealInPoint,
                     sum(player3Riichi)         as riichiCount,
                     count(r.id)                as count
              from JapaneseTransaction t,
                   JapaneseRound r,
                   JapanesePlayerGame pg,
                   JapaneseGame g
              where pg.gameId = r.gameId
                and r.id = t.roundId
                and t.transactionType in ('DEAL_IN', 'DEAL_IN_PAO')
                and (t.paoPlayerIndex IS NULL or t.paoPlayerIndex != 3)
                and t.player3ScoreChange < 0
                and pg.wind = 'NORTH'
                and pg.gameId = g.id
                and g.seasonId = ${seasonId}
                and pg.playerId = ${playerId}) DEALINS
    `;
}
