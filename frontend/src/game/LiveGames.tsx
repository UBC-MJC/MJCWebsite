import { Box, Card, Skeleton, Alert } from "@mui/material";
import { gameRoundString } from "./common/constants";
import GameSummaryCard, { gameSummaryGrid } from "./common/GameSummaryCard";
import { useLiveGames } from "@/hooks/GameHooks";
import type { GameVariant } from "@/types";

const LiveGamesSkeleton = () => (
    <Box sx={gameSummaryGrid}>
        {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} sx={{ display: "flex", flexDirection: "column" }}>
                <Box sx={{ bgcolor: "action.hover", px: 2, py: 1.75, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Skeleton variant="text" width="45%" height={32} />
                    <Skeleton variant="rounded" width={90} height={36} />
                </Box>
                <Box sx={{ p: 1.5 }}>
                    {Array.from({ length: 4 }).map((__, r) => (
                        <Skeleton key={r} variant="rounded" height={36} sx={{ my: 0.75 }} />
                    ))}
                </Box>
            </Card>
        ))}
    </Box>
);

export const LiveGamesSection = ({ gameVariant }: { gameVariant: GameVariant }) => {
    const { isPending, error, data: liveGames } = useLiveGames(gameVariant);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (isPending) {
        return <LiveGamesSkeleton />;
    }

    if (error) {
        return (
            <Alert
                severity="error"
                variant="standard"
                sx={{ maxWidth: 480, mx: "auto", mt: 4 }}
            >
                Failed to load live games. Please try again later.
            </Alert>
        );
    }

    return (
        <>
            {liveGames.length === 0 ? (
                    <Alert
                        severity="info"
                        variant="standard"
                        sx={{ maxWidth: 480, mx: "auto", width: "100%", mt: 2 }}
                    >
                        No live games at the moment.
                    </Alert>
                ) : (
                    <Box sx={gameSummaryGrid}>
                        {liveGames.map((game) => (
                            <GameSummaryCard
                                key={game.id}
                                variant="live"
                                game={game}
                                gameVariant={gameVariant}
                                chipLabel={gameRoundString(game, gameVariant)}
                                timeText={formatDate(game.createdAt)}
                            />
                        ))}
                    </Box>
                )}
        </>
    );
};