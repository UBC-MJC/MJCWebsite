import { Prisma, Season } from "@prisma/client";
import prisma from "../db";
import { NoCurrentSeasonError } from "../errors/domain.error";

const findCurrentSeason = async (): Promise<Season | null> => {
    const seasons: Season[] = await prisma.season.findMany({
        orderBy: {
            endDate: Prisma.SortOrder.desc,
        },
    });

    if (seasons.length === 0 || seasons[0].endDate < new Date()) {
        return null;
    }

    return seasons[0];
};

const getCurrentSeason = async (): Promise<Season> => {
    const season = await findCurrentSeason();
    if (!season) {
        throw new NoCurrentSeasonError();
    }

    return season;
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
    startDate: Date,
    endDate: Date,
): Promise<Season> => {
    return prisma.season.create({
        data: {
            name: seasonName,
            startDate: startDate,
            endDate: endDate,
        },
    });
};

const updateSeason = async (season: Season): Promise<Season> => {
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
    findCurrentSeason,
    getCurrentSeason,
    findAllSeasons,
    createSeason,
    updateSeason,
    deleteSeason,
};
