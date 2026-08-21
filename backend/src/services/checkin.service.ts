import prisma from "../db";

const generateMidnight = (): Date => {
    const date = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Vancouver",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());

    return new Date(`${date}T00:00:00-07:00`);
};

const resetPastCheckIns = async () => {
    const resetTime = generateMidnight();

    await prisma.player.updateMany({
        where: {
            checkedInAt: {
                lt: resetTime,
            },
        },
        data: {
            checkedInAt: null,
        },
    });
};

const checkInPlayer = async (playerId: string) => {
    return prisma.player.update({
        where: {
            id: playerId,
        },
        data: {
            checkedInAt: new Date(),
        },
    });
};

const checkOutPlayer = async (playerId: string) => {
    return prisma.player.update({
        where: {
            id: playerId,
        },
        data: {
            checkedInAt: null,
        },
    });
};

const getStatus = async (playerId: string) => {
    return prisma.player.findUnique({
        where: {
            id: playerId,
        },
        select: {
            checkedInAt: true,
        },
    });
};

const getCheckedInPlayers = async () => {
    await resetPastCheckIns();

    return prisma.player.findMany({
        where: {
            checkedInAt: {
                not: null,
            },
        },
        select: {
            id: true,
            username: true,
            checkedInAt: true,
        },
        orderBy: {
            checkedInAt: "asc",
        },
    });
};

export {
    checkInPlayer,
    checkOutPlayer,
    getStatus,
    getCheckedInPlayers
}