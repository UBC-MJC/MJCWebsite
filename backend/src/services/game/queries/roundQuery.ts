import { Prisma } from "@prisma/client";

export function roundQuery(seasonId, playerId) {
    return Prisma.sql`
        select sum(riichiCount) as riichiCount
        from (select sum(player0Riichi) as riichiCount
              from JapaneseRound r,
                   JapanesePlayerGame pg,
                   JapaneseGame g
              where pg.gameId = r.gameId
                and pg.wind = 'EAST'
                and pg.gameId = g.id
                and g.seasonId = ${seasonId}
                and pg.playerId = ${playerId}
              union all
              select sum(player1Riichi) as riichiCount
              from JapaneseRound r,
                   JapanesePlayerGame pg,
                   JapaneseGame g
              where pg.gameId = r.gameId
                and pg.wind = 'SOUTH'
                and pg.gameId = g.id
                and g.seasonId = ${seasonId}
                and pg.playerId = ${playerId}
              union all
              select sum(player2Riichi) as riichiCount
              from JapaneseRound r,
                   JapanesePlayerGame pg,
                   JapaneseGame g
              where pg.gameId = r.gameId
                and pg.wind = 'WEST'
                and pg.gameId = g.id
                and g.seasonId = ${seasonId}
                and pg.playerId = ${playerId}
              union all
              select sum(player3Riichi) as riichiCount
              from JapaneseRound r,
                   JapanesePlayerGame pg,
                   JapaneseGame g
              where pg.gameId = r.gameId
                and pg.wind = 'NORTH'
                and pg.gameId = g.id
                and g.seasonId = ${seasonId}
                and pg.playerId = ${playerId}) ROUND
    `;
}
