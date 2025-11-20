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
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { getGameVariantString } from "@/common/Utils";
import { gameRoundString } from "./common/constants";
import GameSummaryBody from "./common/GameSummaryBody";
import { useLiveGames } from "@/hooks/GameHooks";
import type { GameCreationProp } from "@/types";
import { responsiveCardHover } from "@/theme/utils";

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
                                                    <Typography variant="h6" component="div">
                                                        {getGameVariantString(
                                                            gameVariant,
                                                            game.type,
                                                        )}{" "}
                                                        #{game.id}
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
                                                        alignItems: "center",
                                                        gap: 0.5,
                                                        mt: 1,
                                                    }}
                                                >
                                                    <CalendarTodayIcon fontSize="small" />
                                                    <Typography variant="caption">
                                                        {formatDate(game.createdAt)}
                                                    </Typography>
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
