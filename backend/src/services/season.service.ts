import {Season} from "@prisma/client";
import prisma from "../db";

const getCurrentSeason = async (): Promise<Season> => {
    const season = await prisma.season.findFirst({
        orderBy: {
            endDate: 'desc',
        },
    })

    if (!season || season.endDate < new Date()) {
        throw new Error("No season in progress")
    }

    return season
}

const findAllSeasons = async (): Promise<Season[]> => {
    return prisma.season.findMany({
        orderBy: {
            startDate: 'desc'
        }
    })
}

const createSeason = async (seasonName: string, startDate: Date, endDate: Date): Promise<Season> => {
    return prisma.season.create({
        data: {
            name: seasonName,
            startDate: startDate,
            endDate: endDate
        }
    })
}

const updateSeason = async (season: Season): Promise<Season> => {
    return prisma.season.update({
        where: {
            id: season.id
        },
        data: {
            name: season.name,
            startDate: season.startDate,
            endDate: season.endDate
        }
    })
}

const deleteSeason = async (id: string): Promise<Season> => {
    return prisma.season.delete({
        where: {
            id
        }
    })
}

export {getCurrentSeason, findAllSeasons, createSeason, updateSeason, deleteSeason}
