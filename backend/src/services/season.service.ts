import { GameType, Prisma, Season } from "@prisma/client";
import prisma from "../db";

const getCurrentSeasons = async (): Promise<Season[]> => {
    return prisma.season.findMany({
        orderBy: {
            endDate: Prisma.SortOrder.desc,
        },
    });
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

export { getCurrentSeasons, findAllSeasons, createSeason, updateSeason, deleteSeason };
