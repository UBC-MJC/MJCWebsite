import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { createGameAPI } from "@/api/GameAPI";
import { AxiosError } from "axios";
import { withPlayerCondition } from "@/common/withPlayerCondition";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "@/common/AuthContext";
import { getGameVariantString } from "@/common/Utils";
import { usePlayers } from "@/hooks/GameHooks";
import LoadingFallback from "@/common/LoadingFallback";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {
    Autocomplete,
    Button,
    ButtonGroup,
    ClickAwayListener,
    Grow,
    MenuItem,
    MenuList,
    Paper,
    Popper,
    TextField,
    Container,
    Grid,
    Typography,
    Stack,
    Box,
    Alert,
} from "@mui/material";
import type { GameType, GameVariant, Player, PlayerNamesDataType } from "@/types";

interface GameOption {
    gameVariant: GameVariant;
    gameType: GameType;
}

// The only variant/type combinations exposed in the create UI.
const ALL_OPTIONS: GameOption[] = [
    { gameVariant: "jp", gameType: "RANKED" },
    { gameVariant: "jp", gameType: "CASUAL" },
    { gameVariant: "hk", gameType: "RANKED" },
    { gameVariant: "hk", gameType: "CASUAL" },
];

const isOptionPermitted = (player: Player | undefined, option: GameOption): boolean => {
    if (player === undefined) {
        return false;
    }
    if (option.gameType === "CASUAL") {
        return true; // everyone is allowed to start casual games
    }
    if (option.gameVariant === "jp") {
        return player.japaneseQualified;
    } else if (option.gameVariant === "hk") {
        return player.hongKongQualified;
    }
    return false;
};

const CreateGameComponent = () => {
    const navigate = useNavigate();
    const { player } = useContext(AuthContext);
    const [searchParams] = useSearchParams();

    // Only offer the variant/type combos this player is permitted to record.
    const permittedOptions = useMemo(
        () => ALL_OPTIONS.filter((option) => isOptionPermitted(player, option)),
        [player],
    );

    // Initial selection: honor ?variant=&type= (used by the legacy-route redirects)
    // when permitted, otherwise default to Riichi Ranked, otherwise the first option.
    const initialIndex = useMemo(() => {
        const variant = searchParams.get("variant");
        const type = searchParams.get("type");
        const fromQuery = permittedOptions.findIndex(
            (option) => option.gameVariant === variant && option.gameType === type,
        );
        if (fromQuery !== -1) {
            return fromQuery;
        }
        const riichiRanked = permittedOptions.findIndex(
            (option) => option.gameVariant === "jp" && option.gameType === "RANKED",
        );
        return riichiRanked !== -1 ? riichiRanked : 0;
        // permittedOptions is stable for a given player; only compute once on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [selectedIndex, setSelectedIndex] = useState(initialIndex);
    const { gameVariant, gameType } = permittedOptions[selectedIndex] ?? permittedOptions[0];

    const [eastPlayer, setEastPlayer] = useState<PlayerNamesDataType | null>(null);
    const [southPlayer, setSouthPlayer] = useState<PlayerNamesDataType | null>(null);
    const [westPlayer, setWestPlayer] = useState<PlayerNamesDataType | null>(null);
    const [northPlayer, setNorthPlayer] = useState<PlayerNamesDataType | null>(null);
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);

    // Split-button dropdown state.
    const [menuOpen, setMenuOpen] = useState(false);
    const anchorRef = useRef<HTMLDivElement>(null);

    const playerNamesResult = usePlayers(gameVariant, gameType);

    // The eligible player set differs per variant/type — clear seat selections on change.
    useEffect(() => {
        setEastPlayer(null);
        setSouthPlayer(null);
        setWestPlayer(null);
        setNorthPlayer(null);
        setAttemptedSubmit(false);
    }, [gameVariant, gameType]);

    const handleMenuSelect = (index: number) => {
        setSelectedIndex(index);
        setMenuOpen(false);
    };

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

    const gameLabel = getGameVariantString(gameVariant, gameType);
    const title = `Create ${gameLabel} Game`;

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
    };

    const playerListNotUnique = () => {
        const playerList = [eastPlayer, southPlayer, westPlayer, northPlayer];
        return (
            new Set(playerList.filter((p) => p !== null)).size !==
            playerList.filter((p) => p !== null).length
        );
    };

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
                    <ButtonGroup variant="contained" ref={anchorRef} aria-label="create game">
                        <Button onClick={createGame} size="large">
                            {`Create ${gameLabel} Game`}
                        </Button>
                        <Button
                            size="large"
                            aria-controls={menuOpen ? "game-type-menu" : undefined}
                            aria-expanded={menuOpen ? "true" : undefined}
                            aria-label="select game type"
                            aria-haspopup="menu"
                            onClick={() => setMenuOpen((prev) => !prev)}
                        >
                            <ArrowDropDownIcon />
                        </Button>
                    </ButtonGroup>
                    <Popper
                        sx={{ zIndex: 1 }}
                        open={menuOpen}
                        anchorEl={anchorRef.current}
                        role={undefined}
                        transition
                        disablePortal
                        placement="bottom-end"
                    >
                        {({ TransitionProps }) => (
                            <Grow {...TransitionProps} style={{ transformOrigin: "right top" }}>
                                <Paper>
                                    <ClickAwayListener onClickAway={() => setMenuOpen(false)}>
                                        <MenuList id="game-type-menu" autoFocusItem>
                                            {permittedOptions.map((option, index) => (
                                                <MenuItem
                                                    key={`${option.gameVariant}-${option.gameType}`}
                                                    selected={index === selectedIndex}
                                                    onClick={() => handleMenuSelect(index)}
                                                >
                                                    {getGameVariantString(
                                                        option.gameVariant,
                                                        option.gameType,
                                                    )}
                                                </MenuItem>
                                            ))}
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                            </Grow>
                        )}
                    </Popper>
                </Box>
            </Stack>
        </Container>
    );
};

// Page-level guard: a player must be logged in and have at least one permitted
// option (every logged-in player may record casual games).
const hasGamePermissions = (player: Player | undefined): boolean => {
    return ALL_OPTIONS.some((option) => isOptionPermitted(player, option));
};

const CreateGame = withPlayerCondition(CreateGameComponent, hasGamePermissions, "/unauthorized");

export default CreateGame;
