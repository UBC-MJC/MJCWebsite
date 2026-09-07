import { GameType, Prisma, Season } from "@prisma/client";
import prisma from "../db";
import { NoCurrentSeasonError } from "../errors/domain.error";

const getCurrentSeasons = async (type?: GameType): Promise<Season[]> => {
    const now = new Date();
    return prisma.season.findMany({
        where: {
            startDate: { lte: now },
            endDate: { gt: now },
            ...(type ? { type } : {}),
        },
        orderBy: { endDate: Prisma.SortOrder.desc },
    });
};

const findCurrentSeason = async (type?: GameType): Promise<Season | null> => {
    const seasons = await getCurrentSeasons(type);
    return seasons[0] ?? null;
};

const getCurrentSeason = async (type?: GameType): Promise<Season> => {
    const season = await findCurrentSeason(type);
    if (!season) {
        throw new NoCurrentSeasonError();
    }

    return season;
};

const findSeason = async (id: string): Promise<Season | null> => {
    return prisma.season.findUnique({ where: { id } });
};

const findAllSeasons = async (): Promise<Season[]> => {
    return prisma.season.findMany({
        orderBy: {
            startDate: Prisma.SortOrder.desc,
        },
    });
};

const createSeason = async (
    seasonName: string,
    type: GameType,
    startDate: Date,
    endDate: Date,
): Promise<Season> => {
    return prisma.season.create({
        data: {
            name: seasonName,
            type: type,
            startDate: startDate,
            endDate: endDate,
        },
    });
};

const updateSeason = async (season: Omit<Season, "type">): Promise<Season> => {
    return prisma.season.update({
        where: {
            id: season.id,
        },
        data: {
            name: season.name,
            startDate: season.startDate,
            endDate: season.endDate,
        },
    });
};

const deleteSeason = async (id: string): Promise<Season> => {
    return prisma.season.delete({
        where: {
            id,
        },
    });
};

export {
    getCurrentSeasons,
    findCurrentSeason,
    getCurrentSeason,
    findSeason,
    findAllSeasons,
    createSeason,
    updateSeason,
    deleteSeason,
};
