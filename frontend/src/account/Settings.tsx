import { useContext, useState } from "react";
import { AuthContext } from "@/common/AuthContext";
import { updateUsernameAPI } from "@/api/AccountAPI";
import { AxiosError } from "axios";
import { logger } from "@/common/logger";
import LoadingFallback from "@/common/LoadingFallback";
import {
    Button,
    Container,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    ToggleButton,
    Typography,
    useColorScheme,
} from "@mui/material";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import SettingsBrightnessRoundedIcon from "@mui/icons-material/SettingsBrightnessRounded";
import { SpacedToggleButtonGroup } from "@/theme/utils";
import { useAccent } from "@/theme/AccentContext";
import { accents, type AccentKey } from "@/theme/tokens";
import redDragonTile from "@/assets/red_dragon_tile.svg";
import whiteDragonTile from "@/assets/white_dragon_tile.svg";
import greenDragonTile from "@/assets/green_dragon_tile.svg";

const Settings = () => {
    const { player, loading, reloadPlayer } = useContext(AuthContext);
    const [showUpdateUsernameModal, setShowUpdateUsernameModal] = useState(false);

    const updateUsername = async (username: string) => {
        try {
            await updateUsernameAPI(username);
            await reloadPlayer();
            setShowUpdateUsernameModal(false);
        } catch (error) {
            logger.log("Error updating username: ", (error as AxiosError).response?.data);
        }
    };

    if (loading) {
        return <LoadingFallback />;
    }

    if (typeof player === "undefined") {
        return (
            <Container>
                <Typography variant="h2">Not Logged In</Typography>
            </Container>
        );
    }

    return (
        <Container>
            <Typography variant="h2" gutterBottom>
                Settings
            </Typography>
            <AppearanceSetting />
            <AccentSetting />
            <Box sx={{ pt: 2, display: "flex", justifyContent: "center" }}>
                <Button
                    onClick={() => setShowUpdateUsernameModal(true)}
                    variant="contained"
                    sx={{ maxWidth: "200px" }}
                >
                    Update Username
                </Button>
            </Box>
            <UpdateUsernameModal
                show={showUpdateUsernameModal}
                handleClose={() => setShowUpdateUsernameModal(false)}
                handleSubmit={updateUsername}
            />
        </Container>
    );
};

/**
 * Color-scheme picker. Persists the literal choice (including "system") via
 * MUI's useColorScheme — "system" follows the OS preference live and survives
 * reloads, rather than being flattened to whatever it currently resolves to.
 */
const AppearanceSetting = () => {
    const { mode, setMode } = useColorScheme();

    // `mode` is briefly undefined before MUI reads the stored value; fall back to
    // the configured default ("system") so the control always shows a selection.
    const value = mode ?? "system";

    return (
        <Box sx={{ pt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Appearance
            </Typography>
            <SpacedToggleButtonGroup
                exclusive
                value={value}
                onChange={(_e, next) => {
                    // Exclusive groups emit null when the active button is re-clicked;
                    // ignore that so a mode always stays selected.
                    if (next !== null) {
                        setMode(next as "light" | "dark" | "system");
                    }
                }}
                aria-label="Color theme"
                size="small"
            >
                <ToggleButton value="light" aria-label="Light mode">
                    <LightModeRoundedIcon fontSize="small" sx={{ mr: 1 }} />
                    Light
                </ToggleButton>
                <ToggleButton value="dark" aria-label="Dark mode">
                    <DarkModeRoundedIcon fontSize="small" sx={{ mr: 1 }} />
                    Dark
                </ToggleButton>
                <ToggleButton value="system" aria-label="System mode">
                    <SettingsBrightnessRoundedIcon fontSize="small" sx={{ mr: 1 }} />
                    System
                </ToggleButton>
            </SpacedToggleButtonGroup>
        </Box>
    );
};

const ACCENT_OPTIONS: { value: AccentKey; label: string; tile: string; color: string }[] = [
    { value: "red", label: "Red", tile: redDragonTile, color: accents.red.pastel.main },
    { value: "blue", label: "Blue", tile: whiteDragonTile, color: accents.blue.pastel.main },
    { value: "green", label: "Green", tile: greenDragonTile, color: accents.green.pastel.main },
];

/**
 * Accent-color picker. Independent of the color scheme above — it rebuilds the
 * theme from the chosen accent variant and persists the choice (default "red").
 */
const AccentSetting = () => {
    const { accent, setAccent } = useAccent();

    return (
        <Box sx={{ pt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Accent
            </Typography>
            <SpacedToggleButtonGroup
                exclusive
                value={accent}
                onChange={(_e, next) => {
                    // Keep a selection when the active button is re-clicked.
                    if (next !== null) {
                        setAccent(next as AccentKey);
                    }
                }}
                aria-label="Accent color"
                size="small"
            >
                {ACCENT_OPTIONS.map((option) => (
                    <ToggleButton
                        key={option.value}
                        value={option.value}
                        aria-label={`${option.label} accent`}
                        sx={{
                            borderTop: "3px solid",
                            borderTopColor: option.color,
                        }}
                    >
                        <img src={option.tile} alt={option.label} style={{ height: 56, width: "auto" }} />
                    </ToggleButton>
                ))}
            </SpacedToggleButtonGroup>
        </Box>
    );
};

interface UpdateUsernameModalProps {
    show: boolean;
    handleClose: () => void;
    handleSubmit: (username: string) => void;
}

const UpdateUsernameModal = ({ show, handleClose, handleSubmit }: UpdateUsernameModalProps) => {
    const [updatedUsername, setUpdatedUsername] = useState("");
    const [errors, setErrors] = useState<{ username?: string }>({});

    const submitUsername = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newErrors = findErrors();
        if (Object.keys(newErrors).length !== 0) {
            setErrors(newErrors);
            return;
        }

        handleSubmit(updatedUsername);
    };

    const findErrors = () => {
        const newErrors: { username?: string } = {};
        if (updatedUsername.length < 1 || updatedUsername.length > 20) {
            newErrors["username"] = "Username must be between 1 and 20 characters";
        } else if (updatedUsername.trim().length === 0) {
            newErrors["username"] = "Username cannot be whitespace only";
        }

        return newErrors;
    };

    const onClose = () => {
        setUpdatedUsername("");
        handleClose();
    };

    return (
        <Dialog open={show} onClose={onClose}>
            <DialogTitle>Update Username</DialogTitle>
            <Box component="form" noValidate onSubmit={submitUsername}>
                <DialogContent>
                    <TextField
                        fullWidth
                        required
                        label="New Username"
                        type="text"
                        placeholder="New Username"
                        defaultValue=""
                        error={!!errors.username}
                        helperText={errors.username}
                        onChange={(e) => setUpdatedUsername(e.target.value)}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={onClose}>
                        Close
                    </Button>
                    <Button variant="contained" type="submit">
                        Update
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default Settings;