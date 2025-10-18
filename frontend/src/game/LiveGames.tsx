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
} from "@mui/material";
import { Link } from "react-router-dom";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { getGameVariantString } from "@/common/Utils";
import { gameRoundString } from "./common/constants";
import GameSummaryBody from "./common/GameSummaryBody";
import { useLiveGames } from "@/hooks/GameHooks";
import type { GameCreationProp } from "@/types";

export const LiveGames = ({ gameVariant }: GameCreationProp) => {
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
        return (
            <Container maxWidth="lg" sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error" variant="standard">
                    Failed to load live games. Please try again later.
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
                Live {getGameVariantString(gameVariant)} Games
            </Typography>

            {liveGames.length === 0 ? (
                <Alert severity="info" variant="standard">
                    No live games at the moment.
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {liveGames.map((game) => (
                        <Grid size={{ xs: 12, md: 6 }} key={game.id}>
                            <Card
                                component={Link}
                                to={`/games/${gameVariant}/${game.id}`}
                                sx={{
                                    height: "100%",
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    textDecoration: "none",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: 6,
                                    },
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
                                                gap: 1,
                                            }}
                                        >
                                            <Typography variant="h6" component="div">
                                                {getGameVariantString(gameVariant, game.type)} #
                                                {game.id}
                                            </Typography>
                                            <Chip
                                                icon={<AccessTimeIcon />}
                                                label={gameRoundString(game, gameVariant)}
                                                color="primary"
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Box>
                                    }
                                    subheader={
                                        <Box
                                            sx={{
                                                display: "flex",
                                                gap: 2,
                                                mt: 1,
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 0.5,
                                                }}
                                            >
                                                <CalendarTodayIcon fontSize="small" />
                                                <Typography variant="caption">
                                                    {formatDate(game.createdAt)}
                                                </Typography>
                                            </Box>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 0.5,
                                                }}
                                            >
                                                <PeopleIcon fontSize="small" />
                                                <Typography variant="caption">
                                                    {game.players.length} Players
                                                </Typography>
                                            </Box>
                                        </Box>
                                    }
                                    sx={{
                                        bgcolor: "action.hover",
                                        "& .MuiCardHeader-subheader": {
                                            color: "text.secondary",
                                        },
                                    }}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <GameSummaryBody game={game} gameVariant={gameVariant} />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};
