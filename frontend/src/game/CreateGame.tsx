import { useState } from "react";
import { createGameAPI } from "@/api/GameAPI";
import { AxiosError } from "axios";
import { withPlayerCondition } from "@/common/withPlayerCondition";
import { useNavigate } from "react-router-dom";
import { getGameVariantString } from "@/common/Utils";
import { usePlayers } from "@/hooks/GameHooks";
import LoadingFallback from "@/common/LoadingFallback";
import {
    Autocomplete,
    Button,
    TextField,
    Container,
    Grid,
    Typography,
    Stack,
    Box,
    Alert,
} from "@mui/material";
import type { GameCreationProp, Player, PlayerNamesDataType } from "@/types";

const CreateGameComponent = ({ gameVariant, gameType }: GameCreationProp) => {
    const navigate = useNavigate();

    const [eastPlayer, setEastPlayer] = useState<PlayerNamesDataType | null>(null);
    const [southPlayer, setSouthPlayer] = useState<PlayerNamesDataType | null>(null);
    const [westPlayer, setWestPlayer] = useState<PlayerNamesDataType | null>(null);
    const [northPlayer, setNorthPlayer] = useState<PlayerNamesDataType | null>(null);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);

    const playerNamesResult = usePlayers(gameVariant, gameType);

    const createGame = async () => {
        setAttemptedSubmit(true);

        if (playerSelectMissing() || playerListNotUnique()) {
            return;
        }

        const playerList = [eastPlayer, southPlayer, westPlayer, northPlayer];
        try {
            const response = await createGameAPI(
                gameType,
                gameVariant,
                playerList.map((playerName) => playerName!.username),
            );
            navigate(`/games/${gameVariant}/${response.data.id}`);
        } catch (error) {
            alert(`Error creating game: ${(error as AxiosError).response?.data}`);
        }
    };

    const title = `Create ${getGameVariantString(gameVariant, gameType)} Game`;

    // const playerSelectMissing = !eastPlayer || !southPlayer || !westPlayer || !northPlayer;


    // Get validation errors
    const getValidationErrors = () => {
        const errors: string[] = [];

        const isPlayerSelectMissing = playerSelectMissing();
        if (isPlayerSelectMissing) {
            const missing: string[] = [];
            if (!eastPlayer) missing.push("East");
            if (!southPlayer) missing.push("South");
            if (!westPlayer) missing.push("West");
            if (!northPlayer) missing.push("North");
            errors.push(
                `Please select ${missing.length === 1 ? "a player" : "players"} for: ${missing.join(", ")}`,
            );
        }

        if (!isPlayerSelectMissing && playerListNotUnique()) {
            errors.push("Each position must have a different player");
        }

        return errors;
    };

    const playerSelectMissing = () => {
        return !eastPlayer || !southPlayer || !westPlayer || !northPlayer;
    }

    const playerListNotUnique = () => {
        const playerList = [eastPlayer, southPlayer, westPlayer, northPlayer];
        return new Set(playerList.filter((p) => p !== null)).size !==
            playerList.filter((p) => p !== null).length;
    }

    const validationErrors = attemptedSubmit ? getValidationErrors() : [];
    if (playerNamesResult.error)
        return (
            <Container>
                <Typography variant="h2" color="error">
                    An error has occurred: {playerNamesResult.error.message}
                </Typography>
            </Container>
        );
    if (!playerNamesResult.isSuccess) {
        return <LoadingFallback minHeight="50vh" message="Loading players..." />;
    }
    const playerNames = playerNamesResult.data.sort((a, b) => a.username.localeCompare(b.username));

    return (
        <Container>
            <Stack spacing={4}>
                <Typography variant="h1">{title}</Typography>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <Autocomplete
                            options={playerNames}
                            getOptionLabel={(option) => option.username}
                            isOptionEqualToValue={(option, value) =>
                                option.username === value.username
                            }
                            value={eastPlayer}
                            blurOnSelect
                            onChange={(_e, value) => setEastPlayer(value)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="East"
                                    placeholder="Select player"
                                    error={attemptedSubmit && !eastPlayer}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <Autocomplete
                            options={playerNames}
                            getOptionLabel={(option) => option.username}
                            isOptionEqualToValue={(option, value) =>
                                option.username === value.username
                            }
                            value={southPlayer}
                            blurOnSelect
                            onChange={(_e, value) => setSouthPlayer(value)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="South"
                                    placeholder="Select player"
                                    error={attemptedSubmit && !southPlayer}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <Autocomplete
                            options={playerNames}
                            getOptionLabel={(option) => option.username}
                            isOptionEqualToValue={(option, value) =>
                                option.username === value.username
                            }
                            value={westPlayer}
                            blurOnSelect
                            onChange={(_e, value) => setWestPlayer(value)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="West"
                                    placeholder="Select player"
                                    error={attemptedSubmit && !westPlayer}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                        <Autocomplete
                            options={playerNames}
                            getOptionLabel={(option) => option.username}
                            isOptionEqualToValue={(option, value) =>
                                option.username === value.username
                            }
                            value={northPlayer}
                            blurOnSelect
                            onChange={(_e, value) => setNorthPlayer(value)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="North"
                                    placeholder="Select player"
                                    error={attemptedSubmit && !northPlayer}
                                />
                            )}
                        />
                    </Grid>
                </Grid>

                {validationErrors.length > 0 && (
                    <Stack spacing={1}>
                        {validationErrors.map((error, index) => (
                            <Alert key={index} severity="error">
                                {error}
                            </Alert>
                        ))}
                    </Stack>
                )}

                <Box display="flex" justifyContent="center">
                    <Button variant="contained" onClick={createGame} size="large">
                        Create Game
                    </Button>
                </Box>
            </Stack>
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
