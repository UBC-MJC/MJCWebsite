import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Grid,
    Typography,
    Tooltip,
    Skeleton,
    Alert,
    CardActionArea,
} from "@mui/material";
import { keyframes } from "@mui/system";
import { Link } from "react-router-dom";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { getGameVariantString } from "@/common/Utils";
import { gameRoundString } from "./common/constants";
import GameSummaryBody from "./common/GameSummaryBody";
import { useLiveGames } from "@/hooks/GameHooks";
import type { GameVariant } from "@/types";
import { responsiveCardHover } from "@/theme/utils";
import { overlay, shadow } from "@/theme/tokens";

// Gentle "breathing" pulse for the live indicator dot.
const pulse = keyframes`
    0%   { opacity: 1;   transform: scale(1);    }
    50%  { opacity: 0.35; transform: scale(0.8); }
    100% { opacity: 1;   transform: scale(1);    }
`;

const LiveGamesSkeleton = () => (
    <Grid container spacing={3}>
        {Array.from({ length: 4 }).map((_, i) => (
            <Grid size={{ xs: 12, md: 6 }} key={i}>
                <Card sx={{ display: "flex", flexDirection: "column" }}>
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
            </Grid>
        ))}
    </Grid>
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
                    <Grid container spacing={3}>
                        {liveGames.map((game) => (
                            <Grid size={{ xs: 12, md: 6 }} key={game.id}>
                                <Card
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        ...responsiveCardHover,
                                        // Keep the gradient/shadow/border hover effects
                                        // but remove the upward lift (translateY).
                                        "&:hover": {
                                            transform: "none",
                                            boxShadow: { xs: "none", sm: shadow.card },
                                            borderColor: "primary.light",
                                            "&::after": { transform: "scaleX(1)" },
                                        },
                                    }}
                                >
                                    <CardActionArea
                                        component={Link}
                                        to={`/games/${gameVariant}/${game.id}`}
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "stretch",
                                            flexGrow: 1,
                                        }}
                                    >
                                        <CardHeader
                                            title={
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        flexWrap: "wrap",
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 1,
                                                            minWidth: 0,
                                                        }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: 9,
                                                                height: 9,
                                                                borderRadius: "50%",
                                                                bgcolor: "primary.main",
                                                                flexShrink: 0,
                                                                animation: `${pulse} 1.6s ease-in-out infinite`,
                                                            }}
                                                        />
                                                        <Typography
                                                            variant="h6"
                                                            component="div"
                                                            sx={{
                                                                fontSize: "1.45rem",
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            {getGameVariantString(
                                                                gameVariant,
                                                                game.type,
                                                            )}{" "}
                                                            #{game.id}
                                                        </Typography>
                                                        <Tooltip
                                                            title={new Date(game.createdAt).toLocaleString()}
                                                            arrow
                                                        >
                                                            <Box
                                                                sx={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: 0.5,
                                                                    color: "text.secondary",
                                                                    flexShrink: 0,
                                                                }}
                                                            >
                                                                <AccessTimeIcon sx={{ fontSize: "1.15rem" }} />
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{ whiteSpace: "nowrap", fontSize: "1rem" }}
                                                                >
                                                                    {formatDate(game.createdAt)}
                                                                </Typography>
                                                            </Box>
                                                        </Tooltip>
                                                    </Box>
                                                    <Chip
                                                        label={gameRoundString(game, gameVariant)}
                                                        size="medium"
                                                        variant="filled"
                                                        sx={{
                                                            height: 45,
                                                            fontSize: "1.1rem",
                                                            fontWeight: 600,
                                                            letterSpacing: "0.04em",
                                                            fontVariantNumeric: "tabular-nums",
                                                            border: "none",
                                                            bgcolor: overlay.primary.row,
                                                            color: "primary.light",
                                                            "& .MuiChip-label": { px: 1.75 },
                                                        }}
                                                    />
                                                </Box>
                                            }
                                            sx={{
                                                bgcolor: "action.hover",
                                            }}
                                        />
                                        <CardContent
                                            sx={{
                                                flexGrow: 1,
                                                px: 1,
                                                pt: 1,
                                                "&:last-child": { pb: 1 },
                                            }}
                                        >
                                            <GameSummaryBody
                                                game={game}
                                                gameVariant={gameVariant}
                                            />
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
        </>
    );
};