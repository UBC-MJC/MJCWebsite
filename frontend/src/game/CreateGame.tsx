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

    const [eastPlayer, setEastPlayer] = useState<string | null>(null);
    const [southPlayer, setSouthPlayer] = useState<string | null>(null);
    const [westPlayer, setWestPlayer] = useState<string | null>(null);
    const [northPlayer, setNorthPlayer] = useState<string | null>(null);

    const playerNamesResult = usePlayers(gameVariant, gameType);

    const createGame = () => {
        if (playerSelectMissing || notUnique) {
            return;
        }

        const playerList = [eastPlayer, southPlayer, westPlayer, northPlayer];
        createGameAPI(player!.authToken, gameType, gameVariant, playerList)
            .then((response) => {
                navigate(`/games/${gameVariant}/${response.data.id}`);
            })
            .catch((error: AxiosError) => {
                alert(`Error creating game: ${error.response?.data}`);
            });
    };

    const title = `Create ${gameType} ${getGameVariantString(gameVariant)} Game`;

    const playerSelectMissing = !eastPlayer || !southPlayer || !westPlayer || !northPlayer;
    const notUnique = new Set([eastPlayer, southPlayer, westPlayer, northPlayer]).size !== 4;
    if (playerNamesResult.error)
        return <>{"An error has occurred: " + playerNamesResult.error.message}</>;
    if (!playerNamesResult.isSuccess) {
        return <>Loading ... </>;
    }
    const playerNames = playerNamesResult.data
        .map((player: PlayerNamesDataType) => player.username)
        .sort((a, b) => a.localeCompare(b))
        .map((name) => {
            return { label: name };
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
                            value={eastPlayer !== null ? { label: eastPlayer } : null}
                            onChange={(event, value) => setEastPlayer(value!.label)}
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
                            value={southPlayer !== null ? { label: southPlayer } : null}
                            onChange={(event, value) => setSouthPlayer(value!.label)}
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
                            value={westPlayer !== null ? { label: westPlayer } : null}
                            onChange={(event, value) => setWestPlayer(value!.label)}
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
                            value={northPlayer !== null ? { label: northPlayer } : null}
                            onChange={(event, value) => setNorthPlayer(value!.label)}
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

const hasGamePermissions = (player: Player | undefined, props: any): boolean => {
    if (props.gameType === "CASUAL") {
        return typeof player !== "undefined"; // everyone is allowed to start casual games
    }
    if (props.gameVariant === "jp") {
        return typeof player !== "undefined" && player.japaneseQualified;
    } else if (props.gameVariant === "hk") {
        return typeof player !== "undefined" && player.hongKongQualified;
    }
    return false;
};

const CreateGame = withPlayerCondition(CreateGameComponent, hasGamePermissions, "/unauthorized");

export default CreateGame;
