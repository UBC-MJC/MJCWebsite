import React, { FC, useContext, useState } from "react";
import { createGameAPI } from "../api/GameAPI";
import { Button, Col, Container, Row } from "react-bootstrap";
import { AxiosError } from "axios";
import { AuthContext } from "../common/AuthContext";
import { withPlayerCondition } from "../common/withPlayerCondition";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { getGameVariantString } from "../common/Utils";
import { usePlayers } from "../hooks/GameHooks";

const CreateGameComponent: FC<GameVariantProp> = ({ gameVariant }) => {
    const navigate = useNavigate();
    const { player } = useContext(AuthContext);

    const [eastPlayer, setEastPlayer] = useState<string | null>(null);
    const [southPlayer, setSouthPlayer] = useState<string | null>(null);
    const [westPlayer, setWestPlayer] = useState<string | null>(null);
    const [northPlayer, setNorthPlayer] = useState<string | null>(null);

    const playerNamesResult = usePlayers(gameVariant);

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

    const title = `Create Ranked ${getGameVariantString(gameVariant)} Game`;

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
                        <Select
                            options={playerNames}
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
                            options={playerNames}
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
                            options={playerNames}
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
                            options={playerNames}
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
