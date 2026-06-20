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
    Stack,
    Chip,
    Divider,
} from "@mui/material";
import { Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import alert from "@/common/AlertDialog";
import GameSummaryBody from "./common/GameSummaryBody";
import { useSeasons } from "@/hooks/AdminHooks";
import { usePlayers } from "@/hooks/GameHooks";
import { getGameVariantString } from "@/common/Utils";
import type { GameVariant, Season, Game, PlayerNamesDataType } from "@/types";
import { responsiveCardHover } from "@/theme/utils";

const gameVariants = [
    { name: "Riichi", variant: "jp" },
    { name: "Hong Kong", variant: "hk" },
] as const;

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
        if (!season && seasonsSorted.length > 0) setSeason(seasonsSorted[0]);
    }, [seasonsSorted]);

    const disableQueryButton = useCallback(
        () => loading || season === null,
        [loading, season],
    );

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
                setPagination(1);
                if (response.data.length === 0) alert("No games found");
            } catch (error) {
                logger.error("Error fetching games: ", (error as AxiosError).response?.data);
            } finally {
                setLoading(false);
            }
        }
    }, [queryGameVariant, season, queryPlayers]);

    const getPaginatedGames = () => {
        const start = (pagination - 1) * MAX_GAMES_PER_PAGE;
        return games.slice(start, start + MAX_GAMES_PER_PAGE);
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
        <Container maxWidth="lg">
            <Stack spacing={3}>
                <Box>
                    <Typography variant="h1" gutterBottom>
                        Game Logs
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Search and browse completed games
                    </Typography>
                </Box>

                {/* Filters */}
                <Card sx={{ overflow: "visible" }}>
                    <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                        <Stack spacing={2}>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Autocomplete
                                        options={gameVariants}
                                        getOptionLabel={(o) => o.name}
                                        isOptionEqualToValue={(o, v) => o.variant === v.variant}
                                        blurOnSelect
                                        value={gameVariants.find((g) => g.variant === queryGameVariant) || gameVariants[0]}
                                        onChange={(_e, v) => v && setQueryGameVariant(v.variant)}
                                        disableClearable
                                        renderInput={(params) => (
                                            <TextField {...params} label="Game Variant" />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Autocomplete
                                        options={seasonsSorted}
                                        getOptionLabel={(o) => o.name}
                                        isOptionEqualToValue={(o, v) => o.id === v.id}
                                        value={season!}
                                        blurOnSelect
                                        disableClearable
                                        onChange={(_e, v) => setSeason(v)}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Season" placeholder="Select a season" />
                                        )}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Autocomplete
                                        options={players}
                                        getOptionLabel={(o) => o.username}
                                        isOptionEqualToValue={(o, v) => o.playerId === v.playerId}
                                        value={queryPlayers}
                                        onChange={(_e, v) => setQueryPlayers(v)}
                                        multiple
                                        disableCloseOnSelect
                                        renderInput={(params) => (
                                            <TextField {...params} label="Players" placeholder="Filter by players" />
                                        )}
                                    />
                                </Grid>
                            </Grid>

                            <Box display="flex" justifyContent={{ xs: "stretch", sm: "flex-end" }}>
                                <Button
                                    variant="contained"
                                    disabled={disableQueryButton()}
                                    onClick={getGames}
                                    size="large"
                                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                                    sx={{ minWidth: { xs: "100%", sm: 160 } }}
                                >
                                    {loading ? "Searching…" : "Search Games"}
                                </Button>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>

                {/* Results count */}
                {games.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                        {games.length} game{games.length !== 1 ? "s" : ""} found
                    </Typography>
                )}

                {/* Game cards */}
                <Grid container spacing={2.5}>
                    {getPaginatedGames().map((game) => (
                        <Grid size={{ xs: 12, md: 6 }} key={game.id}>
                            <Card sx={{ display: "flex", flexDirection: "column", ...responsiveCardHover }}>
                                <CardActionArea
                                    component={Link}
                                    to={`/games/${queryGameVariant}/${game.id}`}
                                    sx={{ display: "flex", flexDirection: "column", alignItems: "stretch", flexGrow: 1 }}
                                >
                                    {/* Card header */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            px: 2,
                                            py: 1.5,
                                            bgcolor: "action.hover",
                                            borderBottom: "1px solid",
                                            borderColor: "divider",
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                {getGameVariantString(queryGameVariant, game.type)} #{game.id}
                                            </Typography>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                                                <CalendarTodayIcon sx={{ fontSize: 11, color: "text.disabled" }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatDate(game.createdAt)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Chip
                                            label={game.type}
                                            size="small"
                                            color={game.type === "RANKED" ? "primary" : "default"}
                                            variant={game.type === "RANKED" ? "filled" : "outlined"}
                                            sx={{ fontWeight: 600, fontSize: "0.68rem" }}
                                        />
                                    </Box>

                                    {/* Card body */}
                                    <CardContent sx={{ flexGrow: 1, p: 2, "&:last-child": { pb: 2 } }}>
                                        <GameSummaryBody game={game} gameVariant={queryGameVariant} />
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* Pagination */}
                {games.length > MAX_GAMES_PER_PAGE && (
                    <Box display="flex" justifyContent="center" pt={1}>
                        <Pagination
                            count={numPages}
                            page={pagination}
                            onChange={(_e, p) => setPagination(p)}
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
