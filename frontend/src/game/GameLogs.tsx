import { useCallback, useEffect, useState } from "react";
import { getGamesAPI } from "@/api/GameAPI";
import { AxiosError } from "axios";
import { logger } from "@/common/logger";
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Autocomplete,
    Button,
    TextField,
    CircularProgress,
    Pagination,
    Stack,
    Collapse,
    IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import alert from "@/common/AlertDialog";
import GameSummaryCard, { gameSummaryGrid } from "./common/GameSummaryCard";
import GameSectionHeader from "./common/GameSectionHeader";
import { useSeasons } from "@/hooks/AdminHooks";
import { usePlayers } from "@/hooks/GameHooks";
import type { GameVariant, Season, Game, PlayerNamesDataType } from "@/types";

const MAX_GAMES_PER_PAGE = 12;

const GameLogsSection = <T extends GameVariant>({ gameVariant }: { gameVariant: T }) => {
    const [season, setSeason] = useState<Season | null>(null);
    const [queryPlayers, setQueryPlayers] = useState<PlayerNamesDataType[]>([]);

    const [loading, setLoading] = useState(false);
    const [games, setGames] = useState<Game<T>[]>([]);
    const [pagination, setPagination] = useState<number>(1);
    const [expanded, setExpanded] = useState(false);

    const { isSuccess: seasonsSuccess, data: seasons } = useSeasons();
    const playersResult = usePlayers(gameVariant, "CASUAL");

    const seasonsSorted =
        seasonsSuccess && seasons ? [...seasons].sort((a, b) => b.id.localeCompare(a.id)) : [];

    useEffect(() => {
        if (!season && seasonsSorted.length > 0) setSeason(seasonsSorted[0]);
    }, [seasonsSorted]);

    // Player lists and results are variant-specific — clear them when the
    // shared variant toggle changes so stale data isn't shown.
    useEffect(() => {
        setQueryPlayers([]);
        setGames([]);
        setPagination(1);
    }, [gameVariant]);

    const disableQueryButton = useCallback(
        () => loading || season === null,
        [loading, season],
    );

    const getGames = useCallback(async () => {
        if (season !== null) {
            setLoading(true);
            try {
                const response = await getGamesAPI(
                    gameVariant,
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
    }, [gameVariant, season, queryPlayers]);

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

    const players = (playersResult.data ?? []).sort((a, b) => a.username.localeCompare(b.username));
    const numPages = Math.ceil(games.length / MAX_GAMES_PER_PAGE);

    return (
        <Stack spacing={3}>
            <GameSectionHeader title="Logs" onClick={() => setExpanded((prev) => !prev)}>
                <IconButton
                    aria-label={expanded ? "Collapse game logs" : "Expand game logs"}
                    aria-expanded={expanded}
                    sx={{
                        transition: "transform 0.2s",
                        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                >
                    <ExpandMoreIcon />
                </IconButton>
            </GameSectionHeader>

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                {!seasonsSuccess || !playersResult.isSuccess ? (
                    <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Stack spacing={3}>
                        {/* Filters */}
                        <Card sx={{ overflow: "visible" }}>
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                    <Stack spacing={2}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
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
                            <Grid size={{ xs: 12, md: 6 }}>
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
                <Box sx={gameSummaryGrid}>
                    {getPaginatedGames().map((game) => (
                        <GameSummaryCard
                            key={game.id}
                            variant="log"
                            game={game}
                            gameVariant={gameVariant}
                            chipLabel={game.type}
                            timeText={formatDate(game.createdAt)}
                        />
                    ))}
                </Box>

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
                )}
            </Collapse>
        </Stack>
    );
};

export default GameLogsSection;
