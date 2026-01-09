import { useCallback, useEffect, useState } from "react";
import { getGamesAPI } from "@/api/GameAPI";
import { AxiosError } from "axios";
import { logger } from "@/common/logger";
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Container,
    Grid,
    Typography,
    Autocomplete,
    Button,
    TextField,
    CircularProgress,
    Pagination,
    CardHeader,
    Stack,
} from "@mui/material";
import { Link } from "react-router-dom";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import alert from "@/common/AlertDialog";
import GameSummaryBody from "./common/GameSummaryBody";
import { useSeasons } from "@/hooks/AdminHooks";
import { usePlayers } from "@/hooks/GameHooks";
import { getGameVariantString } from "@/common/Utils";
import type { GameVariant, Season, Game, PlayerNamesDataType } from "@/types";
import { responsiveCardHover } from "@/theme/utils";

const gameVariants: { name: string; variant: GameVariant }[] = [
    { name: "Riichi", variant: "jp" },
    { name: "Hong Kong", variant: "hk" },
];

const MAX_GAMES_PER_PAGE = 12;

const GameLogs = <T extends GameVariant>() => {
    const [queryGameVariant, setQueryGameVariant] = useState<GameVariant>(gameVariants[0].variant);
    const [season, setSeason] = useState<Season | null>(null);
    const [queryPlayers, setQueryPlayers] = useState<PlayerNamesDataType[]>([]);

    const [loading, setLoading] = useState(false);
    const [games, setGames] = useState<Game<T>[]>([]);
    const [pagination, setPagination] = useState<number>(1);

    const { isSuccess: seasonsSuccess, data: seasons } = useSeasons();
    const playersResult = usePlayers(queryGameVariant, "CASUAL");

    const seasonsSorted =
        seasonsSuccess && seasons ? [...seasons].sort((a, b) => b.id.localeCompare(a.id)) : [];
    useEffect(() => {
        // Always set the first season (most recent) as the default season if available
        if (!season && seasonsSorted.length > 0) {
            setSeason(seasonsSorted[0]);
        }
    }, [seasonsSorted]);

    const disableQueryButton = useCallback((): boolean => {
        return loading || season === null;
    }, [loading, season]);

    const getGames = useCallback(async () => {
        if (season !== null) {
            setLoading(true);
            try {
                const response = await getGamesAPI(
                    queryGameVariant,
                    season.id,
                    queryPlayers.map((p) => p.playerId),
                );
                response.data.reverse();
                setGames(response.data);
                setLoading(false);
                setPagination(1);
                if (response.data.length === 0) {
                    alert("No games found");
                }
            } catch (error) {
                logger.error("Error fetching games: ", (error as AxiosError).response?.data);
                setLoading(false);
            }
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

    if (!seasonsSuccess || !playersResult.isSuccess) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                <CircularProgress />
            </Container>
        );
    }

    const players = playersResult.data.sort((a, b) => a.username.localeCompare(b.username));
    const numPages = Math.ceil(games.length / MAX_GAMES_PER_PAGE);

    return (
        <Container>
            <Stack spacing={3}>
                <Typography variant="h1" align="center">
                    Game Logs
                </Typography>

                {/* Search Filters */}
                <Card>
                    <CardContent>
                        <Stack>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Autocomplete
                                        options={gameVariants}
                                        getOptionLabel={(option) => option.name}
                                        isOptionEqualToValue={(option, value) =>
                                            option.variant === value.variant
                                        }
                                        blurOnSelect
                                        value={
                                            gameVariants.find(
                                                (g) => g.variant === queryGameVariant,
                                            ) || gameVariants[0]
                                        }
                                        onChange={(_e, value) =>
                                            value && setQueryGameVariant(value.variant)
                                        }
                                        disableClearable
                                        renderInput={(params) => (
                                            <TextField {...params} label="Game Variant" />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Autocomplete
                                        options={seasonsSorted}
                                        getOptionLabel={(option) => option.name}
                                        isOptionEqualToValue={(option, value) =>
                                            option.id === value.id
                                        }
                                        value={season!}
                                        blurOnSelect
                                        disableClearable
                                        onChange={(_e, value) => setSeason(value)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Season"
                                                placeholder="Select a season"
                                                inputProps={{
                                                    ...params.inputProps,
                                                    readOnly: true, // This is the key line
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Autocomplete
                                        options={players}
                                        getOptionLabel={(option) => option.username}
                                        isOptionEqualToValue={(option, value) =>
                                            option.playerId === value.playerId
                                        }
                                        value={queryPlayers}
                                        onChange={(_e, value) => setQueryPlayers(value)}
                                        multiple
                                        disableCloseOnSelect
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Players"
                                                placeholder="Filter by players (optional)"
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>

                            <Box display="flex" justifyContent="center">
                                <Button
                                    variant="contained"
                                    disabled={disableQueryButton()}
                                    onClick={getGames}
                                    size="large"
                                >
                                    {loading ? "Searching..." : "Search Games"}
                                </Button>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Game Cards */}
                <Grid container spacing={3}>
                    {getPaginatedGames().map((game) => (
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
                                    to={`/games/${queryGameVariant}/${game.id}`}
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
                                                        queryGameVariant,
                                                        game.type,
                                                    )}{" "}
                                                    #{game.id}
                                                </Typography>
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
                                            gameVariant={queryGameVariant}
                                        />
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Pagination */}
                {games.length > MAX_GAMES_PER_PAGE && (
                    <Box display="flex" justifyContent="center">
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
            </Stack>
        </Container>
    );
};

export default GameLogs;
