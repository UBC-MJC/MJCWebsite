import { Prisma } from "@prisma/client";

export function winQuery(seasonId, playerId) {
    return Prisma.sql`
        select sum(winPoint) as winPoint, sum(count) as count
        from (select sum(t.player0ScoreChange) as winPoint,
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
              union
              select sum(t.player1ScoreChange) as winPoint,
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
              union
              select sum(t.player2ScoreChange) as winPoint,
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
              union
              select sum(t.player3ScoreChange) as winPoint,
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
