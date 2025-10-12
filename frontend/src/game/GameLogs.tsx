import React, { useCallback, useState } from "react";
import { getGamesAPI } from "@/api/GameAPI";
import { AxiosError } from "axios";
import { logger } from "@/common/logger";
import {
    Box,
    Card,
    CardContent,
    Container,
    Grid,
    Typography,
    Autocomplete,
    Button,
    TextField,
    Chip,
    CircularProgress,
    Pagination,
} from "@mui/material";
import { Link } from "react-router-dom";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PeopleIcon from "@mui/icons-material/People";
import alert from "@/common/AlertDialog";
import GameSummaryBody from "./common/GameSummaryBody";
import { mapPlayerNameToOption, mapSeasonToOption } from "./common/constants";
import { useSeasons } from "@/hooks/AdminHooks";
import { usePlayers } from "@/hooks/GameHooks";
import { getGameVariantString } from "@/common/Utils";
import type { GameVariant, Season, Game } from "@/types";

const gameVariants: { label: string; value: GameVariant }[] = [
    { label: "Riichi", value: "jp" },
    { label: "Hong Kong", value: "hk" },
];

const MAX_GAMES_PER_PAGE = 12;

const GameLogs = <T extends GameVariant>() => {
    const [queryGameVariant, setQueryGameVariant] = useState<GameVariant>(gameVariants[0].value);
    const [season, setSeason] = useState<Season | undefined>();
    const [queryPlayers, setQueryPlayers] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [games, setGames] = useState<Game<T>[]>([]);
    const [pagination, setPagination] = useState<number>(1);

    const seasonsResult = useSeasons(setSeason);
    const playersResult = usePlayers(queryGameVariant, "CASUAL");

    const disableQueryButton = useCallback((): boolean => {
        return loading || season == undefined;
    }, [loading, season]);

    const getGames = useCallback(() => {
        if (season != undefined) {
            setLoading(true);
            getGamesAPI(queryGameVariant, season.id, queryPlayers)
                .then((response) => {
                    response.data.reverse();
                    setGames(response.data);
                    setLoading(false);
                    setPagination(1);
                    if (response.data.length === 0) {
                        return alert("No games found");
                    }
                })
                .catch((error: AxiosError) => {
                    logger.error("Error fetching games: ", error.response?.data);
                    setLoading(false);
                });
        }
    }, [queryGameVariant, season, queryPlayers]);

    const getPaginatedGames = () => {
        const startIdx = (pagination - 1) * MAX_GAMES_PER_PAGE;
        const endIdx = Math.min(pagination * MAX_GAMES_PER_PAGE, games.length);

        return games.slice(startIdx, endIdx);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (!seasonsResult.isSuccess || !playersResult.isSuccess) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                <CircularProgress />
            </Container>
        );
    }

    const seasonsOptions = mapSeasonToOption(seasonsResult.data);
    const playersOptions = mapPlayerNameToOption(playersResult.data);
    const numPages = Math.ceil(games.length / MAX_GAMES_PER_PAGE);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
                Game Logs
            </Typography>

            {/* Search Filters */}
            <Box
                sx={{
                    mb: 4,
                    p: 3,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    boxShadow: 1,
                }}
            >
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Game Variant
                        </Typography>
                        <Autocomplete
                            isOptionEqualToValue={(option, value) => option.label === value.label}
                            options={gameVariants}
                            defaultValue={gameVariants[0]}
                            onChange={(event, value) => setQueryGameVariant(value!.value)}
                            renderInput={(params) => (
                                <TextField {...params} placeholder="Choose a variant" />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Season
                        </Typography>
                        <Autocomplete
                            isOptionEqualToValue={(option, value) => option.label === value.label}
                            options={seasonsOptions}
                            onChange={(event, value) => setSeason(value!.value)}
                            renderInput={(params) => (
                                <TextField {...params} placeholder="Default: this season" />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Players
                        </Typography>
                        <Autocomplete
                            isOptionEqualToValue={(option, value) => option.label === value.label}
                            options={playersOptions}
                            multiple
                            disableCloseOnSelect
                            onChange={(event, value) =>
                                setQueryPlayers(value!.map((player) => player.value))
                            }
                            renderInput={(params) => (
                                <TextField {...params} placeholder="Leave blank for all players" />
                            )}
                        />
                    </Grid>
                </Grid>
                <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                    <Button
                        variant="contained"
                        disabled={disableQueryButton()}
                        onClick={getGames}
                        size="large"
                    >
                        {loading ? <CircularProgress size={24} /> : "Search Games"}
                    </Button>
                </Box>
            </Box>

            {/* Game Cards */}
            <Grid container spacing={3}>
                {getPaginatedGames().map((game) => (
                    <Grid size={{ xs: 12, md: 6 }} key={game.id}>
                        <Link
                            to={`/games/${queryGameVariant}/${game.id}`}
                            style={{
                                textDecoration: "none",
                                width: "100%",
                                display: "block",
                            }}
                        >
                            <Card
                                sx={{
                                    height: "100%",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: 6,
                                    },
                                }}
                            >
                                <CardContent>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            mb: 2,
                                            flexWrap: "wrap",
                                            gap: 1,
                                        }}
                                    >
                                        <Box>
                                            <Typography
                                                variant="h6"
                                                component="div"
                                                sx={{ textAlign: "left" }}
                                            >
                                                {getGameVariantString(queryGameVariant, game.type)}{" "}
                                                #{game.id}
                                            </Typography>
                                            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                                                <Chip
                                                    icon={<CalendarTodayIcon />}
                                                    label={formatDate(game.createdAt)}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                                <Chip
                                                    icon={<PeopleIcon />}
                                                    label={`${game.players.length} Players`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                    <GameSummaryBody game={game} gameVariant={queryGameVariant} />
                                </CardContent>
                            </Card>
                        </Link>
                    </Grid>
                ))}
            </Grid>

            {/* Pagination */}
            {games.length > MAX_GAMES_PER_PAGE && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <Pagination
                        count={numPages}
                        page={pagination}
                        onChange={(event, page) => setPagination(page)}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}
        </Container>
    );
};

export default GameLogs;
