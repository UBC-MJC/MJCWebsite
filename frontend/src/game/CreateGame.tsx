import { useContext, useState } from "react";
import { createGameAPI } from "@/api/GameAPI";
import { AxiosError } from "axios";
import { withPlayerCondition } from "@/common/withPlayerCondition";
import { useNavigate } from "react-router";
import { getGameVariantString } from "@/common/Utils";
import { usePlayers } from "@/hooks/GameHooks";
import { useCurrentSeasons } from "@/hooks/AdminHooks";
import { AuthContext } from "@/common/AuthContext";
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
import type { GameVariantProp, GameVariant, Player, PlayerNamesDataType, Season } from "@/types";

const CreateGameComponent = <T extends GameVariant>({ gameVariant }: GameVariantProp<T>) => {
    const navigate = useNavigate();
    const { player } = useContext(AuthContext);
    const currentSeasonsResult = useCurrentSeasons();
    const eligibleSeasons = (currentSeasonsResult.data ?? []).filter((candidate) => {
        if (candidate.type === "CASUAL") return true;
        return gameVariant === "jp" ? player?.japaneseQualified : player?.hongKongQualified;
    });
    const [selectedSeasonId, setSelectedSeasonId] = useState<string>();
    const season =
        eligibleSeasons.find((candidate) => candidate.id === selectedSeasonId) ??
        eligibleSeasons[0] ??
        null;

    const [eastPlayer, setEastPlayer] = useState<PlayerNamesDataType | null>(null);
    const [southPlayer, setSouthPlayer] = useState<PlayerNamesDataType | null>(null);
    const [westPlayer, setWestPlayer] = useState<PlayerNamesDataType | null>(null);
    const [northPlayer, setNorthPlayer] = useState<PlayerNamesDataType | null>(null);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);

    const playerNamesResult = usePlayers(gameVariant, season?.type);

    const selectSeason = (selectedSeason: Season) => {
        setSelectedSeasonId(selectedSeason.id);
        setEastPlayer(null);
        setSouthPlayer(null);
        setWestPlayer(null);
        setNorthPlayer(null);
        setAttemptedSubmit(false);
    };

    const createGame = async () => {
        setAttemptedSubmit(true);

        if (!season || playerSelectMissing() || playerListNotUnique()) {
            return;
        }

        const playerList = [eastPlayer, southPlayer, westPlayer, northPlayer];
        try {
            const response = await createGameAPI(
                gameVariant,
                playerList.map((playerName) => playerName!.username),
                season.id,
            );
            navigate(`/games/${gameVariant}/${response.data.id}`);
        } catch (error) {
            alert(`Error creating game: ${(error as AxiosError).response?.data}`);
        }
    };

    const title = `Create ${getGameVariantString(gameVariant, season?.type)} Game`;

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
    };

    const playerListNotUnique = () => {
        const playerList = [eastPlayer, southPlayer, westPlayer, northPlayer];
        return (
            new Set(playerList.filter((p) => p !== null)).size !==
            playerList.filter((p) => p !== null).length
        );
    };

    const validationErrors = attemptedSubmit ? getValidationErrors() : [];
    if (currentSeasonsResult.isPending) {
        return <LoadingFallback minHeight="50vh" message="Loading active seasons..." />;
    }
    if (currentSeasonsResult.error) {
        return (
            <Container>
                <Alert severity="error">Failed to load active seasons.</Alert>
            </Container>
        );
    }
    if (eligibleSeasons.length === 0) {
        return (
            <Container>
                <Typography variant="h1">
                    Create {getGameVariantString(gameVariant)} Game
                </Typography>
                <Alert severity="info">There are no active seasons you can record games for.</Alert>
            </Container>
        );
    }
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

                <Autocomplete
                    options={eligibleSeasons}
                    value={season!}
                    getOptionLabel={(option) => `${option.name} (${option.type.replace("_", " ")})`}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    disableClearable
                    onChange={(_event, value) => selectSeason(value)}
                    renderInput={(params) => <TextField {...params} label="Season" />}
                />

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

const hasGamePermissions = <T extends GameVariant>(
    player: Player | undefined,
    _props: GameVariantProp<T>,
): boolean => {
    return player !== undefined;
};

const CreateGame = withPlayerCondition(CreateGameComponent, hasGamePermissions, "/unauthorized");

export default CreateGame;
