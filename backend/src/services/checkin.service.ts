import prisma from "../db";

const CHECK_IN_EXPIRATION_HR = 4; // Number of hours check-in lasts for
const CHECK_IN_EXPIRATION_MS = CHECK_IN_EXPIRATION_HR * 60 * 60 * 1000;

const getCheckInCutoffTime = (): Date => { return new Date(Date.now() - CHECK_IN_EXPIRATION_MS); };

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

const checkInPlayers = async (playerIds: string[]) => {
    return prisma.player.updateMany({
        where: {
            id: {
                in: playerIds,
            },
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
    return prisma.player.findFirst({
        where: {
            id: playerId,
            checkedInAt: {
                gt: getCheckInCutoffTime(),
            }
        },
        select: {
            checkedInAt: true,
        },
    });
};

const getCheckedInPlayers = async () => {
    return prisma.player.findMany({
        where: {
            checkedInAt: {
                gt: getCheckInCutoffTime(),
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

const resetAllCheckIns = async () => {
    return prisma.player.updateMany({
        data: {
            checkedInAt: null,
        },
    });
};

export {
    checkInPlayer,
    checkInPlayers,
    checkOutPlayer,
    getStatus,
    getCheckedInPlayers,
    resetAllCheckIns,
    CHECK_IN_EXPIRATION_HR
}