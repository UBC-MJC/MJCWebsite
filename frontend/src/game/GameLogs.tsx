import React, { FC, useState } from "react";
import { getGamesAPI } from "../api/GameAPI";
import { AxiosError } from "axios";
import { Card, Col, Container, Pagination, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import alert from "../common/AlertDialog";
import GameSummaryBody from "./common/GameSummaryBody";
import { mapPlayerNameToOption, mapSeasonToOption } from "./common/constants";
import { useSeasons } from "../hooks/AdminHooks";
import { usePlayers } from "../hooks/GameHooks";
import { Autocomplete, Button, TextField } from "@mui/material";

const gameVariants: { label: string; value: GameVariant }[] = [
    { label: "Riichi", value: "jp" },
    { label: "Hong Kong", value: "hk" },
];

const MAX_GAMES_PER_PAGE = 12;

const GameLogs: FC = () => {
    const navigate = useNavigate();
    const [queryGameVariant, setQueryGameVariant] = useState<GameVariant>(gameVariants[0].value);
    const [querySeasonId, setQuerySeasonId] = useState<string | undefined>();
    const [queryPlayers, setQueryPlayers] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [games, setGames] = useState<Game[]>([]);
    const [pagination, setPagination] = useState<number>(1);

    const seasonsResult = useSeasons();
    const playersResult = usePlayers(queryGameVariant);

    const disableQueryButton = (): boolean => {
        return loading || typeof querySeasonId === "undefined";
    };

    const getGames = () => {
        setLoading(true);
        getGamesAPI(queryGameVariant, querySeasonId!, queryPlayers)
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
    };

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
            <Pagination className="justify-content-center" size="lg">
                <Pagination.Prev
                    disabled={pagination === 1}
                    onClick={() => setPagination(pagination - 1)}
                />
                {pagination !== 1 && (
                    <Pagination.Item onClick={() => setPagination(1)}>{1}</Pagination.Item>
                )}
                {pagination > 2 && <Pagination.Ellipsis disabled />}

                <Pagination.Item active>{pagination}</Pagination.Item>

                {pagination < numPages - 1 && <Pagination.Ellipsis disabled />}
                {pagination !== numPages && (
                    <Pagination.Item onClick={() => setPagination(numPages)}>
                        {numPages}
                    </Pagination.Item>
                )}
                <Pagination.Next
                    disabled={pagination === numPages}
                    onClick={() => setPagination(pagination + 1)}
                />
            </Pagination>
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
                <h1 className="my-4">Game Logs</h1>
                <Row>
                    <Col xs={12} lg={4} className="mb-4">
                        <h3>Game Variant</h3>
                        <div className="text-start">
                            <Autocomplete
                                isOptionEqualToValue={(option, value) =>
                                    option.label === value.label
                                }
                                options={gameVariants}
                                defaultValue={gameVariants[0]}
                                onChange={(event, value) => setQueryGameVariant(value!.value)}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Choose a season" />
                                )}
                            />
                        </div>
                    </Col>
                    <Col xs={12} lg={4} className="mb-4">
                        <h3>Season</h3>
                        <div className="text-start">
                            <Autocomplete
                                isOptionEqualToValue={(option, value) =>
                                    option.label === value.label
                                }
                                options={seasonsOptions}
                                onChange={(event, value) => setQuerySeasonId(value!.value.id)}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Choose a season" />
                                )}
                            />
                        </div>
                    </Col>
                    <Col xs={12} lg={4} className="mb-4">
                        <h3>Players</h3>
                        <div className="text-start">
                            <Autocomplete
                                isOptionEqualToValue={(option, value) =>
                                    option.label === value.label
                                }
                                options={playersOptions}
                                multiple
                                disableCloseOnSelect
                                onChange={(event, value) =>
                                    setQueryPlayers(value!.map((player) => player.value))
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Leave blank for all players"
                                    />
                                )}
                            />
                        </div>
                    </Col>
                </Row>
                <Button
                    className="my-2 mx-auto"
                    variant={"contained"}
                    disabled={disableQueryButton()}
                    onClick={getGames}
                >
                    Search Games
                </Button>
            </Container>
            <Container>
                <Row>
                    {getPaginatedGames().map((game, idx) => (
                        <Col key={idx} className="text-center my-2" xs={12}>
                            <Card className="game-card" onClick={() => navigateToGame(game.id)}>
                                <Card.Body>
                                    <GameSummaryBody game={game} gameVariant={queryGameVariant} />
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
                <Row className="my-2">{getPagination()}</Row>
            </Container>
        </>
    );
};

export default GameLogs;
