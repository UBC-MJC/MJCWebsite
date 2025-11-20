import { useContext, useState } from "react";
import { AuthContext } from "@/common/AuthContext";
import { updateUsernameAPI } from "@/api/AccountAPI";
import { AxiosError } from "axios";
import { logger } from "@/common/logger";
import {
    ButtonGroup,
    Button,
    Container,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
} from "@mui/material";
import { ColorModeContext } from "@/App";

const Settings = () => {
    const { player, reloadPlayer } = useContext(AuthContext);
    const colorMode = useContext(ColorModeContext);
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

    if (typeof player === "undefined") {
        return (
            <Container>
                <Typography variant="h2">Not Logged In</Typography>
            </Container>
        );
    }

    // Safety check: if colorMode context is not available, show loading state
    if (!colorMode) {
        return (
            <Container>
                <Typography variant="h2">Loading...</Typography>
            </Container>
        );
    }

    return (
        <Container>
            <Typography variant="h2" gutterBottom>
                Settings
            </Typography>
            <Typography variant="h3" gutterBottom>
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
