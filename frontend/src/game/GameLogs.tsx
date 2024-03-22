import React, {FC, useEffect, useState} from "react";
import {getGamesAPI, getPlayerNames} from "../api/GameAPI";
import {AxiosError} from "axios";
import {Button, Col, Container, Row} from "react-bootstrap";
import Select from "react-select";
import {getSeasonsAPI} from "../api/AdminAPI";

const gameVariants: {label: string, value: GameVariant}[] = [
    {label: "Riichi", value: "jp"},
    {label: "Hong Kong", value: "hk"},
];

const GameLogs: FC = () => {
    const [seasons, setSeasons] = useState<OptionsType[]>([]);
    const [players, setPlayers] = useState<OptionsType[]>([]);

    const [queryGameVariant, setQueryGameVariant] = useState<GameVariant>(gameVariants[0].value);
    const [querySeason, setQuerySeason] = useState<string | undefined>();
    const [queryPlayers, setQueryPlayers] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [games, setGames] = useState<Game[]>([]);

    useEffect(() => {
        getSeasonsAPI()
            .then((response) => {
                const allSeasons = response.data.pastSeasons;
                if (response.data.currentSeason) {
                    allSeasons.unshift(response.data.currentSeason);
                }

                const selectOptions = allSeasons.map((season) => {
                    return { label: season.name, value: season.id };
                });

                setSeasons(selectOptions);
            })
            .catch((error: AxiosError) => {
                console.error("Error fetching seasons: ", error.response?.data);
            });
    }, []);

    useEffect(() => {
        getPlayerNames(queryGameVariant)
            .then((response) => {
                const selectOptions = response.data.map((player) => {
                    return { label: player.username, value: player.playerId };
                });

                setPlayers(selectOptions);
            }).catch((error: AxiosError) => {
                console.error("Error fetching players: ", error.response?.data);
            });
    }, [queryGameVariant]);

    const disableQueryButton = (): boolean => {
        return loading || typeof querySeason === "undefined";
    }

    const getGames = () => {
        setLoading(true);
        getGamesAPI(queryGameVariant, querySeason!, queryPlayers)
            .then((response) => {
                setGames(response.data);
                console.log(response.data);
                setLoading(false);
            })
            .catch((error: AxiosError) => {
                console.error("Error fetching games: ", error.response?.data);
                setLoading(false);
            });
    }

    return (
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
                            onChange={(e) => setQuerySeason(e!.value)}
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
    );
}

export default GameLogs;