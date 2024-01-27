import React, { FC, useContext, useEffect, useState } from "react";
import { createGameAPI, getCurrentGamesAPI, getPlayerNames } from "../api/GameAPI";
import { Button, Col, Container, Row } from "react-bootstrap";
import { AxiosError } from "axios";
import { AuthContext } from "../common/AuthContext";
import { withPlayerCondition } from "../common/withPlayerCondition";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { getGameTypeString } from "../common/Utils";
import Game from "./Game";

const CreateGameComponent: FC<GameTypeProp> = ({ gameVariant }) => {
    const navigate = useNavigate();
    const { player } = useContext(AuthContext);

    const [playerNames, setPlayerNames] = useState<string[]>([]);

    const [eastPlayer, setEastPlayer] = useState<string | null>(null);
    const [southPlayer, setSouthPlayer] = useState<string | null>(null);
    const [westPlayer, setWestPlayer] = useState<string | null>(null);
    const [northPlayer, setNorthPlayer] = useState<string | null>(null);
    const [currentGames, setCurrentGames] = useState<Game[]>([]);

    useEffect(() => {
        getPlayerNames(gameVariant)
            .then((response) => {
                setPlayerNames(response.data.playerNames.sort());
            })
            .catch((error: AxiosError) => {
                alert(`Error fetching player names: ${error.response?.data}`);
            });

        getCurrentGamesAPI(gameVariant)
            .then((response) => {
                console.log("Current games: ");
                console.log(response.data);
                setCurrentGames(response.data);
            })
            .catch((error: AxiosError) => {
                alert(`Error fetching current games: ${error.response?.data}`);
            });
    }, [gameVariant]);

    const createGame = () => {
        if (playerSelectMissing || notUnique) {
            return;
        }

        const playerList = [eastPlayer, southPlayer, westPlayer, northPlayer];
        createGameAPI(player!.authToken, "RANKED", gameVariant, playerList)
            .then((response) => {
                navigate(`/games/${gameVariant}/${response.data.id}`);
            })
            .catch((error: AxiosError) => {
                alert(`Error creating game: ${error.response?.data}`);
            });
    };

    const title = `Create Ranked ${getGameTypeString(gameVariant)} Game`;

    const selectOptions = playerNames.map((name) => {
        return { label: name };
    });

    const playerSelectMissing = !eastPlayer || !southPlayer || !westPlayer || !northPlayer;
    const notUnique = new Set([eastPlayer, southPlayer, westPlayer, northPlayer]).size !== 4;

    function getGamePlayers(game: Game) {
        console.log(game.players);
        const usernames = game.players.map((player: GamePlayer) => player.username);
        return usernames.toString();
    }

    return (
        <Container>
            <h1 className="my-4">{title}</h1>
            <Row>
                <Col xs={12} md={6} lg={3} className="mb-4">
                    <h3>East</h3>
                    <div className="text-start">
                        <Select
                            options={selectOptions}
                            isSearchable
                            placeholder="Choose a Player"
                            value={eastPlayer !== null ? { label: eastPlayer } : null}
                            getOptionValue={(selectOptions) => selectOptions.label}
                            onChange={(e) => setEastPlayer(e!.label)}
                        />
                    </div>
                </Col>
                <Col xs={12} md={6} lg={3} className="mb-4">
                    <h3>South</h3>
                    <div className="text-start">
                        <Select
                            options={selectOptions}
                            isSearchable
                            placeholder="Choose a Player"
                            value={southPlayer !== null ? { label: southPlayer } : null}
                            getOptionValue={(selectOptions) => selectOptions.label}
                            onChange={(e) => setSouthPlayer(e!.label)}
                        />
                    </div>
                </Col>
                <Col xs={12} md={6} lg={3} className="mb-4">
                    <h3>West</h3>
                    <div className="text-start">
                        <Select
                            options={selectOptions}
                            isSearchable
                            placeholder="Choose a Player"
                            value={westPlayer !== null ? { label: westPlayer } : null}
                            getOptionValue={(selectOptions) => selectOptions.label}
                            onChange={(e) => setWestPlayer(e!.label)}
                        />
                    </div>
                </Col>
                <Col xs={12} md={6} lg={3} className="mb-4">
                    <h3>North</h3>
                    <div className="text-start">
                        <Select
                            options={selectOptions}
                            isSearchable
                            placeholder="Choose a Player"
                            value={northPlayer !== null ? { label: northPlayer } : null}
                            getOptionValue={(selectOptions) => selectOptions.label}
                            onChange={(e) => setNorthPlayer(e!.label)}
                        />
                    </div>
                </Col>
            </Row>
            <Button
                className="my-4 mx-auto"
                variant="primary"
                disabled={playerSelectMissing || notUnique}
                onClick={createGame}
            >
                Create Game
            </Button>
            <Row>
                {currentGames.map((game, idx) => (
                    <div key={idx}>
                        <p>
                            <b>{game.id}</b>{" "}
                            <a href={"../" + gameVariant + "/" + game.id}>{getGamePlayers(game)}</a>
                        </p>
                    </div>
                ))}
            </Row>
        </Container>
    );
};

const hasGamePermissions = (player: Player | undefined, props: any): boolean => {
    if (props.gameVariant === "jp") {
        return typeof player !== "undefined" && player.japaneseQualified;
    } else if (props.gameVariant === "hk") {
        return typeof player !== "undefined" && player.hongKongQualified;
    }
    return false;
};

const CreateGame = withPlayerCondition(CreateGameComponent, hasGamePermissions, "/unauthorized");

export default CreateGame;
