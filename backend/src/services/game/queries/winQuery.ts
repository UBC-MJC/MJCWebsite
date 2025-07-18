import { Prisma } from "@prisma/client";

export function winQuery(seasonId, playerId) {
    return Prisma.sql`
        select sum(winPoint) as winPoint, sum(riichiCount) as riichiCount, sum(count) as count
        from (select sum(t.player0ScoreChange) as winPoint,
                     sum(player0Riichi)        as riichiCount,
                     count(r.id)               as count
              from JapaneseTransaction t,
                   JapaneseRound r,
                   JapanesePlayerGame pg,
                   JapaneseGame g
              where pg.gameId = r.gameId
                and r.id = t.roundId
                and t.player0ScoreChange > 0
                and pg.wind = 'EAST'
                and pg.gameId = g.id
                and g.seasonId = ${seasonId}
                and pg.playerId = ${playerId}
              union all
              select sum(t.player1ScoreChange) as winPoint,
                     sum(player1Riichi)        as riichiCount,
                     count(r.id)               as count
              from JapaneseTransaction t,
                   JapaneseRound r,
                   JapanesePlayerGame pg,
                   JapaneseGame g
              where pg.gameId = r.gameId
                and r.id = t.roundId
                and t.player1ScoreChange > 0
                and pg.wind = 'SOUTH'
                and pg.gameId = g.id
                and g.seasonId = ${seasonId}
                and pg.playerId = ${playerId}
              union all
              select sum(t.player2ScoreChange) as winPoint,
                     sum(player2Riichi)        as riichiCount,
                     count(r.id)               as count
              from JapaneseTransaction t,
                   JapaneseRound r,
                   JapanesePlayerGame pg,
                   JapaneseGame g
              where pg.gameId = r.gameId
                and r.id = t.roundId
                and t.player2ScoreChange > 0
                and pg.wind = 'WEST'
                and pg.gameId = g.id
                and g.seasonId = ${seasonId}
                and pg.playerId = ${playerId}
              union all
              select sum(t.player3ScoreChange) as winPoint,
                     sum(player3Riichi)        as riichiCount,
                     count(r.id)               as count
              from JapaneseTransaction t,
                   JapaneseRound r,
                   JapanesePlayerGame pg,
                   JapaneseGame g
              where pg.gameId = r.gameId
                and r.id = t.roundId
                and t.player3ScoreChange > 0
                and pg.wind = 'NORTH'
                and pg.gameId = g.id
                and g.seasonId = ${seasonId}
                and pg.playerId = ${playerId}) WINS
    `;
}
