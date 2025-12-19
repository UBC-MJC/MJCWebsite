import { useContext, useState } from "react";
import { AuthContext } from "@/common/AuthContext";
import { updateUsernameAPI } from "@/api/AccountAPI";
import { AxiosError } from "axios";
import { logger } from "@/common/logger";
import {
    Button,
    Container,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    FormControl,
    RadioGroup,
    FormControlLabel,
    FormLabel,
    useColorScheme,
} from "@mui/material";
import Radio from "@mui/material/Radio";

const Settings = () => {
    const { player, reloadPlayer } = useContext(AuthContext);
    const { mode, setMode } = useColorScheme();
    const [showUpdateUsernameModal, setShowUpdateUsernameModal] = useState(false);

    if (!mode) {
        return null;
    }

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

    return (
        <Container>
            <Typography variant="h2" gutterBottom>
                Settings
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 3,
                }}
            >
                <FormControl>
                    <FormLabel id="theme-toggle-label">Theme</FormLabel>
                    <RadioGroup
                        aria-labelledby="theme-toggle-label"
                        name="theme-toggle"
                        row
                        value={mode}
                        onChange={(event) =>
                            setMode(event.target.value as "system" | "light" | "dark")
                        }
                    >
                        <FormControlLabel value="system" control={<Radio />} label="System" />
                        <FormControlLabel value="light" control={<Radio />} label="Light" />
                        <FormControlLabel value="dark" control={<Radio />} label="Dark" />
                    </RadioGroup>
                </FormControl>
            </Box>
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
