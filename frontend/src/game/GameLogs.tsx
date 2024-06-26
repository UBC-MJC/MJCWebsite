import React, { FC, useEffect, useState } from "react";
import { getGamesAPI, getPlayerNames } from "../api/GameAPI";
import { AxiosError } from "axios";
import { Button, Card, Col, Container, Pagination, Row } from "react-bootstrap";
import Select from "react-select";
import { getSeasonsAPI } from "../api/AdminAPI";
import { useNavigate } from "react-router-dom";
import alert from "../common/AlertDialog";
import GameSummaryBody from "./common/GameSummaryBody";
import { mapPlayerNameToOption, mapSeasonToOption } from "./common/constants";

const gameVariants: { label: string; value: GameVariant }[] = [
    { label: "Riichi", value: "jp" },
    { label: "Hong Kong", value: "hk" },
];

const MAX_GAMES_PER_PAGE = 12;

const GameLogs: FC = () => {
    const navigate = useNavigate();

    const [seasons, setSeasons] = useState<OptionsType<Season>[]>([]);
    const [players, setPlayers] = useState<OptionsType<string>[]>([]);

    const [queryGameVariant, setQueryGameVariant] = useState<GameVariant>(gameVariants[0].value);
    const [querySeasonId, setQuerySeasonId] = useState<string | undefined>();
    const [queryPlayers, setQueryPlayers] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [games, setGames] = useState<Game[]>([]);
    const [pagination, setPagination] = useState<number>(1);

    useEffect(() => {
        getSeasonsAPI()
            .then((response) => {
                const allSeasons = response.data.pastSeasons;
                const selectOptions = mapSeasonToOption(allSeasons);

                setSeasons(selectOptions);
            })
            .catch((error: AxiosError) => {
                console.error("Error fetching seasons: ", error.response?.data);
            });
    }, []);

    useEffect(() => {
        getPlayerNames(queryGameVariant)
            .then((response) => {
                setPlayers(mapPlayerNameToOption(response.data));
            })
            .catch((error: AxiosError) => {
                console.error("Error fetching players: ", error.response?.data);
            });
    }, [queryGameVariant]);

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

    return (
        <>
            <Container>
                <h1 className="my-4">Game Logs</h1>
                <Row>
                    <Col xs={12} lg={4} className="mb-4">
                        <h3>Game Variant</h3>
                        <div className="text-start">
                            <Select
                                options={gameVariants}
                                defaultValue={gameVariants[0]}
                                getOptionValue={(selectOptions) => selectOptions.label}
                                onChange={(e) => setQueryGameVariant(e!.value)}
                            />
                        </div>
                    </Col>
                    <Col xs={12} lg={4} className="mb-4">
                        <h3>Season</h3>
                        <div className="text-start">
                            <Select
                                options={seasons}
                                isSearchable
                                placeholder="Choose a season"
                                getOptionValue={(selectOptions) => selectOptions.label}
                                onChange={(e) => setQuerySeasonId(e!.value.id)}
                            />
                        </div>
                    </Col>
                    <Col xs={12} lg={4} className="mb-4">
                        <h3>Players</h3>
                        <div className="text-start">
                            <Select
                                options={players}
                                isMulti
                                isSearchable
                                placeholder="Leave blank for all players"
                                getOptionValue={(selectOptions) => selectOptions.label}
                                onChange={(e) => setQueryPlayers(e!.map((player) => player.value))}
                            />
                        </div>
                    </Col>
                </Row>
                <Button
                    className="my-2 mx-auto"
                    variant="primary"
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
