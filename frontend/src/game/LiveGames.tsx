import {
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Container,
    Grid,
    Typography,
    CircularProgress,
    Alert,
    Stack,
    CardActionArea,
} from "@mui/material";
import { Link } from "react-router-dom";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { getGameVariantString } from "@/common/Utils";
import { gameRoundString } from "./common/constants";
import GameSummaryBody from "./common/GameSummaryBody";
import { useLiveGames } from "@/hooks/GameHooks";
import type { GameCreationProp, GameVariant } from "@/types";
import { responsiveCardHover } from "@/theme/utils";
import { shadow } from "@/theme/tokens";

export const LiveGames = <T extends GameVariant>({ gameVariant }: GameCreationProp<T>) => {
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
        return <CircularProgress sx={{ mt: 4 }} />;
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" variant="standard">
                    Failed to load live games. Please try again later.
                </Alert>
            </Container>
        );
    }

    return (
        <Container>
            <Stack>
                <Typography variant="h1">Live {getGameVariantString(gameVariant)} Games</Typography>

                {liveGames.length === 0 ? (
                    <Alert severity="info" variant="standard">
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
                                        "&:hover .header-title-group": {
                                            transform: "scale(1.05)",
                                        },
                                        "&:hover .round-chip": {
                                            transform: "scale(1.05)",
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
                                                        className="header-title-group"
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "baseline",
                                                            gap: 1,
                                                            minWidth: 0,
                                                            transformOrigin: "left center",
                                                            transition: "transform 0.2s cubic-bezier(0.4,0,0.2,1)",
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="h6"
                                                            component="div"
                                                            sx={{
                                                                fontSize: "1.25rem",
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            {getGameVariantString(
                                                                gameVariant,
                                                                game.type,
                                                            )}{" "}
                                                            #{game.id}
                                                        </Typography>
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 0.5,
                                                                color: "text.secondary",
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            <AccessTimeIcon sx={{ fontSize: "1rem" }} />
                                                            <Typography
                                                                variant="body2"
                                                                sx={{ whiteSpace: "nowrap" }}
                                                            >
                                                                {formatDate(game.createdAt)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Chip
                                                        className="round-chip"
                                                        label={gameRoundString(game, gameVariant)}
                                                        color="primary"
                                                        size="medium"
                                                        variant="outlined"
                                                        sx={{
                                                            height: 40,
                                                            fontSize: "0.95rem",
                                                            fontWeight: 600,
                                                            transformOrigin: "right center",
                                                            transition: "transform 0.2s cubic-bezier(0.4,0,0.2,1)",
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
            </Stack>
        </Container>
    );
};