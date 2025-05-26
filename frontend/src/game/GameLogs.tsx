import React, { FC, useCallback, useState } from "react";
import { getGamesAPI } from "../api/GameAPI";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import alert from "../common/AlertDialog";
import GameSummaryBody from "./common/GameSummaryBody";
import { mapPlayerNameToOption, mapSeasonToOption } from "./common/constants";
import { useSeasons } from "../hooks/AdminHooks";
import { usePlayers } from "../hooks/GameHooks";
import {
    Autocomplete,
    Button,
    TextField,
    Stack,
    Box,
    Card,
    Pagination,
    Container,
} from "@mui/material";

const gameVariants: { label: string; value: GameVariant }[] = [
    { label: "Riichi", value: "jp" },
    { label: "Hong Kong", value: "hk" },
];

const MAX_GAMES_PER_PAGE = 12;

const GameLogs: FC = () => {
    const navigate = useNavigate();
    const [queryGameVariant, setQueryGameVariant] = useState<GameVariant>(gameVariants[0].value);
    const [season, setSeason] = useState<Season | undefined>();
    const [queryPlayers, setQueryPlayers] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [games, setGames] = useState<Game[]>([]);
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
                    console.error("Error fetching games: ", error.response?.data);
                    setLoading(false);
                });
        }
    }, [queryGameVariant, season, queryPlayers]);

    const navigateToGame = (gameId: string) => {
        navigate(`/games/${queryGameVariant}/${gameId}`);
    };

    const getPaginatedGames = () => {
        const startIdx = (pagination - 1) * MAX_GAMES_PER_PAGE;
        const endIdx = Math.min(pagination * MAX_GAMES_PER_PAGE, games.length);

        return games.slice(startIdx, endIdx);
    };

    const getPagination = () => {
        if (games.length <= MAX_GAMES_PER_PAGE) {
            return null;
        }

        const numPages = Math.ceil(games.length / MAX_GAMES_PER_PAGE);

        return (
            <Stack direction="row" justifyContent="center" mt={2}>
                <Pagination
                    count={numPages}
                    page={pagination}
                    onChange={(_, value) => setPagination(value)}
                    showFirstButton
                    showLastButton
                    color="primary"
                />
            </Stack>
        );
    };
    if (!seasonsResult.isSuccess || !playersResult.isSuccess) {
        return <>Loading ...</>;
    }
    const seasonsOptions = mapSeasonToOption(seasonsResult.data);
    const playersOptions = mapPlayerNameToOption(playersResult.data);

    return (
        <>
            <Container>
                <h1>Game Logs</h1>
                <Stack direction="row" spacing={2}>
                    <Stack direction="column" spacing={1}>
                        <h3>Game Variant</h3>
                        <Autocomplete
                            isOptionEqualToValue={(option, value) => option.label === value.label}
                            options={gameVariants}
                            defaultValue={gameVariants[0]}
                            onChange={(event, value) => setQueryGameVariant(value!.value)}
                            renderInput={(params) => (
                                <TextField {...params} placeholder="Choose a variant" />
                            )}
                        />
                    </Stack>
                    <Stack direction="column" spacing={1}>
                        <h3>Season</h3>
                        <Autocomplete
                            isOptionEqualToValue={(option, value) => option.label === value.label}
                            options={seasonsOptions}
                            onChange={(event, value) => setSeason(value!.value)}
                            renderInput={(params) => (
                                <TextField {...params} placeholder="Default: this season" />
                            )}
                        />
                    </Stack>
                    <Stack direction="column" spacing={1}>
                        <h3>Players</h3>
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
                    </Stack>
                </Stack>
                <Button variant={"contained"} disabled={disableQueryButton()} onClick={getGames}>
                    Search Games
                </Button>
            </Container>
            <Container>
                <Stack direction="column" spacing={2}>
                    {getPaginatedGames().map((game, idx) => (
                        <Box key={idx} onClick={() => navigateToGame(game.id)}>
                            <Card variant="outlined">
                                <Box p={2}>
                                    <GameSummaryBody game={game} gameVariant={queryGameVariant} />
                                </Box>
                            </Card>
                        </Box>
                    ))}
                </Stack>
                {getPagination()}
            </Container>
        </>
    );
};

export default GameLogs;
