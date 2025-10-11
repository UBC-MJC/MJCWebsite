import React, { FC, useState } from "react";
import { createGameAPI } from "@/api/GameAPI";
import { AxiosError } from "axios";
import { withPlayerCondition } from "@/common/withPlayerCondition";
import { useNavigate } from "react-router-dom";
import { getGameVariantString } from "@/common/Utils";
import { usePlayers } from "@/hooks/GameHooks";
import { Autocomplete, Button, TextField, Container, Grid, Typography } from "@mui/material";
import type { GameCreationProp, Player, PlayerNamesDataType } from "@/types";

const CreateGameComponent: FC<GameCreationProp> = ({ gameVariant, gameType }) => {
    const navigate = useNavigate();

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
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
                {title}
            </Typography>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <Typography variant="h5" component="h3" gutterBottom>
                        East
                    </Typography>
                    <Autocomplete
                        isOptionEqualToValue={(option, value) => option.label === value.label}
                        options={playerNames}
                        disableClearable
                        onChange={(event, value) => setEastPlayer(value!.value)}
                        renderInput={(params) => (
                            <TextField {...params} placeholder="Choose a Player" />
                        )}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <Typography variant="h5" component="h3" gutterBottom>
                        South
                    </Typography>
                    <Autocomplete
                        isOptionEqualToValue={(option, value) => option.label === value.label}
                        options={playerNames}
                        disableClearable
                        onChange={(event, value) => setSouthPlayer(value!.value)}
                        renderInput={(params) => (
                            <TextField {...params} placeholder="Choose a Player" />
                        )}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <Typography variant="h5" component="h3" gutterBottom>
                        West
                    </Typography>
                    <Autocomplete
                        isOptionEqualToValue={(option, value) => option.label === value.label}
                        options={playerNames}
                        disableClearable
                        onChange={(event, value) => setWestPlayer(value!.value)}
                        renderInput={(params) => (
                            <TextField {...params} placeholder="Choose a Player" />
                        )}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <Typography variant="h5" component="h3" gutterBottom>
                        North
                    </Typography>
                    <Autocomplete
                        isOptionEqualToValue={(option, value) => option.label === value.label}
                        options={playerNames}
                        disableClearable
                        onChange={(event, value) => setNorthPlayer(value!.value)}
                        renderInput={(params) => (
                            <TextField {...params} placeholder="Choose a Player" />
                        )}
                    />
                </Grid>
            </Grid>
            <Button
                sx={{ my: 4, mx: "auto", display: "block" }}
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
