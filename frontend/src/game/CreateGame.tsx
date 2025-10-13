import { useState } from "react";
import { createGameAPI } from "@/api/GameAPI";
import { AxiosError } from "axios";
import { withPlayerCondition } from "@/common/withPlayerCondition";
import { useNavigate } from "react-router-dom";
import { getGameVariantString } from "@/common/Utils";
import { usePlayers } from "@/hooks/GameHooks";
import LoadingFallback from "@/common/LoadingFallback";
import { Autocomplete, Button, TextField, Container, Grid, Typography } from "@mui/material";
import type { GameCreationProp, Player, PlayerNamesDataType } from "@/types";

const CreateGameComponent = ({ gameVariant, gameType }: GameCreationProp) => {
    const navigate = useNavigate();

    const [eastPlayer, setEastPlayer] = useState<PlayerNamesDataType | null>(null);
    const [southPlayer, setSouthPlayer] = useState<PlayerNamesDataType | null>(null);
    const [westPlayer, setWestPlayer] = useState<PlayerNamesDataType | null>(null);
    const [northPlayer, setNorthPlayer] = useState<PlayerNamesDataType | null>(null);

    const playerNamesResult = usePlayers(gameVariant, gameType);

    const createGame = async () => {
        if (playerSelectMissing || notUnique) {
            return;
        }

        const playerList = [eastPlayer, southPlayer, westPlayer, northPlayer];
        try {
            const response = await createGameAPI(
                gameType,
                gameVariant,
                playerList.map((playerName) => playerName?.username),
            );
            navigate(`/games/${gameVariant}/${response.data.id}`);
        } catch (error) {
            alert(`Error creating game: ${(error as AxiosError).response?.data}`);
        }
    };

    const title = `Create ${getGameVariantString(gameVariant, gameType)} Game`;

    const playerSelectMissing = !eastPlayer || !southPlayer || !westPlayer || !northPlayer;
    const notUnique = new Set([eastPlayer, southPlayer, westPlayer, northPlayer]).size !== 4;
    if (playerNamesResult.error)
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="body1" color="error">
                    An error has occurred: {playerNamesResult.error.message}
                </Typography>
            </Container>
        );
    if (!playerNamesResult.isSuccess) {
        return <LoadingFallback minHeight="50vh" message="Loading players..." />;
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
                    <Typography variant="h5" component="h3" gutterBottom id="east-player-label">
                        East
                    </Typography>
                    <Autocomplete
                        isOptionEqualToValue={(option, value) => option.label === value.label}
                        options={playerNames}
                        disableClearable
                        onChange={(event, value) => setEastPlayer(value!.value)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Choose a Player"
                                aria-labelledby="east-player-label"
                                required
                            />
                        )}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <Typography variant="h5" component="h3" gutterBottom id="south-player-label">
                        South
                    </Typography>
                    <Autocomplete
                        isOptionEqualToValue={(option, value) => option.label === value.label}
                        options={playerNames}
                        disableClearable
                        onChange={(event, value) => setSouthPlayer(value!.value)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Choose a Player"
                                aria-labelledby="south-player-label"
                                required
                            />
                        )}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <Typography variant="h5" component="h3" gutterBottom id="west-player-label">
                        West
                    </Typography>
                    <Autocomplete
                        isOptionEqualToValue={(option, value) => option.label === value.label}
                        options={playerNames}
                        disableClearable
                        onChange={(event, value) => setWestPlayer(value!.value)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Choose a Player"
                                aria-labelledby="west-player-label"
                                required
                            />
                        )}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <Typography variant="h5" component="h3" gutterBottom id="north-player-label">
                        North
                    </Typography>
                    <Autocomplete
                        isOptionEqualToValue={(option, value) => option.label === value.label}
                        options={playerNames}
                        disableClearable
                        onChange={(event, value) => setNorthPlayer(value!.value)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                placeholder="Choose a Player"
                                aria-labelledby="north-player-label"
                                required
                            />
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
