import React, { FC, useContext, useState } from "react";
import { createGameAPI } from "../api/GameAPI";
import { Col, Container, Row } from "react-bootstrap";
import { AxiosError } from "axios";
import { AuthContext } from "../common/AuthContext";
import { withPlayerCondition } from "../common/withPlayerCondition";
import { useNavigate } from "react-router-dom";
import { getGameVariantString } from "../common/Utils";
import { usePlayers } from "../hooks/GameHooks";
import { Autocomplete, Button, TextField } from "@mui/material";

const CreateGameComponent: FC<GameCreationProp> = ({ gameVariant, gameType }) => {
    const navigate = useNavigate();
    const { player } = useContext(AuthContext);

    const [eastPlayer, setEastPlayer] = useState<PlayerNamesDataType | null>(null);
    const [southPlayer, setSouthPlayer] = useState<PlayerNamesDataType | null>(null);
    const [westPlayer, setWestPlayer] = useState<PlayerNamesDataType | null>(null);
    const [northPlayer, setNorthPlayer] = useState<PlayerNamesDataType | null>(null);

    const playerNamesResult = usePlayers(gameVariant, gameType);

    const createGame = () => {
        if (playerSelectMissing || notUnique) {
            return;
        }

        const playerList = [eastPlayer, southPlayer, westPlayer, northPlayer];
        createGameAPI(
            gameType,
            gameVariant,
            playerList.map((playerName) => playerName?.username),
        )
            .then((response) => {
                navigate(`/games/${gameVariant}/${response.data.id}`);
            })
            .catch((error: AxiosError) => {
                alert(`Error creating game: ${error.response?.data}`);
            });
    };

    const title = `Create ${getGameVariantString(gameVariant, gameType)} Game`;

    const playerSelectMissing = !eastPlayer || !southPlayer || !westPlayer || !northPlayer;
    const notUnique = new Set([eastPlayer, southPlayer, westPlayer, northPlayer]).size !== 4;
    if (playerNamesResult.error)
        return <>{"An error has occurred: " + playerNamesResult.error.message}</>;
    if (!playerNamesResult.isSuccess) {
        return <>Loading ... </>;
    }
    const playerNames = playerNamesResult.data
        .sort((a, b) => a.username.localeCompare(b.username))
        .map((player) => {
            return { label: player.username, value: player };
        });
    return (
        <Container>
            <h1 className="my-4">{title}</h1>
            <Row>
                <Col xs={12} md={6} lg={3} className="mb-4">
                    <h3>East</h3>
                    <div className="text-start">
                        <Autocomplete
                            isOptionEqualToValue={(option, value) => option.label === value.label}
                            options={playerNames}
                            disableClearable
                            onChange={(event, value) => setEastPlayer(value!.value)}
                            renderInput={(params) => (
                                <TextField {...params} placeholder="Choose a Player" />
                            )}
                        />
                    </div>
                </Col>
                <Col xs={12} md={6} lg={3} className="mb-4">
                    <h3>South</h3>
                    <div className="text-start">
                        <Autocomplete
                            isOptionEqualToValue={(option, value) => option.label === value.label}
                            options={playerNames}
                            disableClearable
                            onChange={(event, value) => setSouthPlayer(value!.value)}
                            renderInput={(params) => (
                                <TextField {...params} placeholder="Choose a Player" />
                            )}
                        />
                    </div>
                </Col>
                <Col xs={12} md={6} lg={3} className="mb-4">
                    <h3>West</h3>
                    <div className="text-start">
                        <Autocomplete
                            isOptionEqualToValue={(option, value) => option.label === value.label}
                            options={playerNames}
                            disableClearable
                            onChange={(event, value) => setWestPlayer(value!.value)}
                            renderInput={(params) => (
                                <TextField {...params} placeholder="Choose a Player" />
                            )}
                        />
                    </div>
                </Col>
                <Col xs={12} md={6} lg={3} className="mb-4">
                    <h3>North</h3>
                    <div className="text-start">
                        <Autocomplete
                            isOptionEqualToValue={(option, value) => option.label === value.label}
                            options={playerNames}
                            disableClearable
                            onChange={(event, value) => setNorthPlayer(value!.value)}
                            renderInput={(params) => (
                                <TextField {...params} placeholder="Choose a Player" />
                            )}
                        />
                    </div>
                </Col>
            </Row>
            <Button
                className="my-4 mx-auto"
                variant="contained"
                disabled={playerSelectMissing || notUnique}
                onClick={createGame}
            >
                Create Game
            </Button>
        </Container>
    );
};

const hasGamePermissions = (player: Player | undefined, props: GameCreationProp): boolean => {
    if (player === undefined) {
        return false;
    }
    if (props.gameType === "CASUAL") {
        return true; // everyone is allowed to start casual games
    }
    if (props.gameVariant === "jp") {
        return player.japaneseQualified;
    } else if (props.gameVariant === "hk") {
        return player.hongKongQualified;
    }
    return false;
};

const CreateGame = withPlayerCondition(CreateGameComponent, hasGamePermissions, "/unauthorized");

export default CreateGame;
