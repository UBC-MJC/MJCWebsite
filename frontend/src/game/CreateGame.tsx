import React, { FC, useContext, useState } from "react";
import { createGameAPI } from "../api/GameAPI";
import { AxiosError } from "axios";
import { AuthContext } from "../common/AuthContext";
import { withPlayerCondition } from "../common/withPlayerCondition";
import { useNavigate } from "react-router-dom";
import { getGameVariantString } from "../common/Utils";
import { usePlayers } from "../hooks/GameHooks";
import { Autocomplete, Button, TextField, Stack, Container, Typography } from "@mui/material";

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
            player!.authToken,
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
            <Typography variant="h4" component="h1" gutterBottom>
                {title}
            </Typography>
            <Stack direction="row" spacing={2}>
                <Stack direction="column" spacing={1} flex={1}>
                    <Typography variant="h6">East</Typography>
                    <Autocomplete
                        isOptionEqualToValue={(option, value) => option.label === value.label}
                        options={playerNames}
                        disableClearable
                        onChange={(event, value) => setEastPlayer(value!.value)}
                        renderInput={(params) => (
                            <TextField {...params} placeholder="Choose a Player" />
                        )}
                    />
                </Stack>
                <Stack direction="column" spacing={1} flex={1}>
                    <Typography variant="h6">South</Typography>
                    <Autocomplete
                        isOptionEqualToValue={(option, value) => option.label === value.label}
                        options={playerNames}
                        disableClearable
                        onChange={(event, value) => setSouthPlayer(value!.value)}
                        renderInput={(params) => (
                            <TextField {...params} placeholder="Choose a Player" />
                        )}
                    />
                </Stack>
                <Stack direction="column" spacing={1} flex={1}>
                    <Typography variant="h6">West</Typography>
                    <Autocomplete
                        isOptionEqualToValue={(option, value) => option.label === value.label}
                        options={playerNames}
                        disableClearable
                        onChange={(event, value) => setWestPlayer(value!.value)}
                        renderInput={(params) => (
                            <TextField {...params} placeholder="Choose a Player" />
                        )}
                    />
                </Stack>
                <Stack direction="column" spacing={1} flex={1}>
                    <Typography variant="h6">North</Typography>
                    <Autocomplete
                        isOptionEqualToValue={(option, value) => option.label === value.label}
                        options={playerNames}
                        disableClearable
                        onChange={(event, value) => setNorthPlayer(value!.value)}
                        renderInput={(params) => (
                            <TextField {...params} placeholder="Choose a Player" />
                        )}
                    />
                </Stack>
            </Stack>
            <Button
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
