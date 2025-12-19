import { useContext, useState } from "react";
import {
    Button,
    TextField,
    Stack,
    Autocomplete,
    Snackbar,
    Alert,
    Box,
    Typography,
} from "@mui/material";
import { AuthContext } from "@/common/AuthContext";
import { setChomboAPI } from "@/api/GameAPI";
import { usePlayers } from "@/hooks/GameHooks";
import LoadingFallback from "@/common/LoadingFallback";
import type { GameVariant } from "@/types";
import { logger } from "@/common/logger";

const gameVariants: { label: string; value: GameVariant }[] = [
    { label: "Riichi", value: "jp" },
    { label: "Hong Kong", value: "hk" },
];

const AdminChombo = () => {
    const { player, loading } = useContext(AuthContext);
    const [gameId, setGameId] = useState<number | "">("");
    const [gameVariant, setGameVariant] = useState<GameVariant>("jp");
    const [playerId, setPlayerId] = useState<string>("");
    const [chomboCount, setChomboCount] = useState<number | "">("");
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({
        open: false,
        message: "",
        severity: "success",
    });
    const [errors, setErrors] = useState({
        gameId: false,
        playerId: false,
        chomboCount: false,
    });
    const playersResult = usePlayers(gameVariant, "CASUAL");

    if (loading) {
        return <LoadingFallback />;
    }

    if (!player) {
        return <>No player logged in</>;
    }
    if (!playersResult.isSuccess) {
        return <>Loading ...</>;
    }

    const validateForm = (): boolean => {
        const newErrors = {
            gameId: gameId === "" || gameId <= 0,
            playerId: playerId === "",
            chomboCount: chomboCount === "" || (typeof chomboCount === "number" && chomboCount < 0),
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some((error) => error);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateForm()) {
            setSnackbar({
                open: true,
                message: "Please fill in all required fields correctly.",
                severity: "error",
            });
            return;
        }

        try {
            const response = await setChomboAPI(
                gameId as number,
                gameVariant,
                playerId,
                chomboCount as number,
            );
            if (response.data.count === 0) {
                setSnackbar({
                    open: true,
                    message: "No chombo count updated!",
                    severity: "error",
                });
                return;
            }
            setSnackbar({
                open: true,
                message: "Chombo count updated successfully!",
                severity: "success",
            });
            // Reset form
            setGameId("");
            setPlayerId("");
            setChomboCount("");
            setErrors({ gameId: false, playerId: false, chomboCount: false });
        } catch (error) {
            logger.error("Failed to update chombo count:", error);
            setSnackbar({
                open: true,
                message: "Failed to update chombo count.",
                severity: "error",
            });
        }
    };

    const playerOptions = playersResult.data.map((p) => ({
        label: p.username,
        value: p.playerId,
    }));

    return (
        <Stack spacing={3}>
            <Box>
                <Typography variant="h2" gutterBottom>
                    Update Chombo Count
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Manually adjust chombo penalties for a player in a specific game.
                </Typography>
            </Box>

            <Stack spacing={2} component="form" onSubmit={handleSubmit}>
                <Autocomplete
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    options={gameVariants}
                    defaultValue={gameVariants[0]}
                    onChange={(_, value) => {
                        if (value) {
                            setGameVariant(value.value);
                        }
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Game Variant"
                            required
                            helperText="Select the game variant (Riichi or Hong Kong)"
                        />
                    )}
                />

                <TextField
                    label="Game ID"
                    type="number"
                    value={gameId}
                    onChange={(e) => {
                        const value = e.target.value;
                        setGameId(value === "" ? "" : Number(value));
                        setErrors((prev) => ({ ...prev, gameId: false }));
                    }}
                    error={errors.gameId}
                    helperText={
                        errors.gameId
                            ? "Game ID must be a positive number"
                            : "Enter the unique game ID"
                    }
                    required
                    fullWidth
                />

                <Autocomplete
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    options={playerOptions}
                    value={playerOptions.find((option) => option.value === playerId) || null}
                    onChange={(_, value) => {
                        setPlayerId(value?.value || "");
                        setErrors((prev) => ({ ...prev, playerId: false }));
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Player"
                            required
                            error={errors.playerId}
                            helperText={
                                errors.playerId
                                    ? "Please select a player"
                                    : "Select the player to update"
                            }
                        />
                    )}
                />

                <TextField
                    label="Chombo Count"
                    type="number"
                    value={chomboCount}
                    onChange={(e) => {
                        const value = e.target.value;
                        setChomboCount(value === "" ? "" : Number(value));
                        setErrors((prev) => ({ ...prev, chomboCount: false }));
                    }}
                    error={errors.chomboCount}
                    helperText={
                        errors.chomboCount
                            ? "Chombo count must be zero or greater"
                            : "Enter the new chombo count (0 or positive number)"
                    }
                    required
                    fullWidth
                    inputProps={{ min: 0 }}
                />

                <Button type="submit" variant="contained" color="primary" size="large">
                    Update Chombo Count
                </Button>
            </Stack>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Stack>
    );
};
export default AdminChombo;
