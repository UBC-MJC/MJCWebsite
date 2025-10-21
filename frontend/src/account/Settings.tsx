import { useContext, useState } from "react";
import type { Setting } from "@/types";
import { AuthContext } from "@/common/AuthContext";
import { updateSettingsAPI, updateUsernameAPI } from "@/api/AccountAPI";
import { AxiosError } from "axios";
import { logger } from "@/common/logger";
import {
    ButtonGroup,
    Button,
    FormControlLabel,
    Switch,
    Container,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
} from "@mui/material";
import { useColorMode } from "@/App";

const Settings = () => {
    const { player, reloadPlayer } = useContext(AuthContext);
    const colorMode = useColorMode();

    const [settings, setSettings] = useState<Setting>((): Setting => {
        return {
            legacyDisplayGame: player!.legacyDisplayGame,
        };
    });
    const [showUpdateUsernameModal, setShowUpdateUsernameModal] = useState(false);

    const handleToggle = async (checked: boolean, setting: string) => {
        const newSettings: Setting = {
            ...settings,
            [setting]: checked,
        };
        setSettings(newSettings);
        try {
            await updateSettingsAPI(newSettings);
            await reloadPlayer();
        } catch (error) {
            logger.log("Error updating settings: ", (error as AxiosError).response?.data);
        }
    };

    const updateUsername = async (username: string) => {
        try {
            await updateUsernameAPI(username);
            await reloadPlayer();
            setShowUpdateUsernameModal(false);
        } catch (error) {
            logger.log("Error updating username: ", (error as AxiosError).response?.data);
        }
    };

    if (typeof player === "undefined") {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h4" component="h1">
                    Not Logged In
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
                Settings
            </Typography>
            {/*<Box sx={{ maxWidth: "300px", mx: "auto", my: 3 }}>*/}
            {/*    <FormControlLabel*/}
            {/*        label="Legacy Display Game"*/}
            {/*        defaultChecked={settings.legacyDisplayGame}*/}
            {/*        control={*/}
            {/*            <Switch*/}
            {/*                onChange={(_e, checked) => handleToggle(checked, "legacyDisplayGame")}*/}
            {/*            />*/}
            {/*        }*/}
            {/*    />*/}
            {/*</Box>*/}
            <Typography variant="h6" component="h2" sx={{ mb: 2, textAlign: "center" }}>
                Theme
            </Typography>
            <ButtonGroup variant="contained" aria-label="Color mode selection" sx={{ mb: 3 }}>
                <Button
                    onClick={() => colorMode.toggleColorMode("light")}
                    variant={colorMode.mode === "light" ? "contained" : "outlined"}
                    color={colorMode.mode === "light" ? "primary" : "inherit"}
                >
                    Light
                </Button>
                <Button
                    onClick={() => colorMode.toggleColorMode("dark")}
                    variant={colorMode.mode === "dark" ? "contained" : "outlined"}
                    color={colorMode.mode === "dark" ? "primary" : "inherit"}
                >
                    Dark
                </Button>
                <Button onClick={() => colorMode.toggleColorMode("system")} variant="outlined">
                    System
                </Button>
            </ButtonGroup>
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
