import React, { FC, useContext, useState } from "react";
import { AuthContext } from "../common/AuthContext";
import { updateSettingsAPI, updateUsernameAPI } from "../api/AccountAPI";
import { AxiosError } from "axios";
import {
    ButtonGroup,
    Button,
    FormControlLabel,
    Switch,
    Stack,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { ColorModeContext } from "../App";

const Settings: FC = () => {
    const { player, reloadPlayer } = useContext(AuthContext);

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
        updateSettingsAPI(player!.authToken, newSettings)
            .then(() => {
                return reloadPlayer();
            })
            .catch((error: AxiosError) => {
                console.log("Error updating settings: ", error.response?.data);
            });
    };

    const updateUsername = async (username: string) => {
        return updateUsernameAPI(player!.authToken, username)
            .then(() => {
                return reloadPlayer();
            })
            .then(() => {
                setShowUpdateUsernameModal(false);
            })
            .catch((error: AxiosError) => {
                console.log("Error updating username: ", error.response?.data);
            });
    };

    if (typeof player === "undefined") {
        return <h1>Not Logged In</h1>;
    }
    const colorMode = React.useContext(ColorModeContext);

    return (
        <Stack spacing={3}>
            <h1>Settings</h1>
            <Stack direction="column" spacing={2}>
                <FormControlLabel
                    label="Legacy Display Game"
                    control={
                        <Switch
                            checked={settings.legacyDisplayGame}
                            onChange={(e, checked) => handleToggle(checked, "legacyDisplayGame")}
                        />
                    }
                />
            </Stack>
            <ButtonGroup aria-label="Basic button group">
                <Button onClick={() => colorMode.toggleColorMode("light")}>Light</Button>
                <Button onClick={() => colorMode.toggleColorMode("dark")}>Dark</Button>
                <Button onClick={() => colorMode.toggleColorMode("system")}>System</Button>
            </ButtonGroup>
            <Stack direction="row" spacing={2}>
                <Button
                    onClick={() => setShowUpdateUsernameModal(true)}
                    variant="contained"
                    style={{ maxWidth: "200px" }}
                >
                    Update Username
                </Button>
            </Stack>
            <UpdateUsernameModal
                show={showUpdateUsernameModal}
                handleClose={() => setShowUpdateUsernameModal(false)}
                handleSubmit={updateUsername}
            />
        </Stack>
    );
};

type UpdateUsernameModalProps = {
    show: boolean;
    handleClose: () => void;
    handleSubmit: (username: string) => void;
};

const UpdateUsernameModal: FC<UpdateUsernameModalProps> = ({ show, handleClose, handleSubmit }) => {
    const [updatedUsername, setUpdatedUsername] = useState("");
    const [errors, setErrors] = useState<any>({});

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
        const newErrors: any = {};
        if (updatedUsername.length < 2 || updatedUsername.length > 20) {
            newErrors["username"] = "Username must be between 2 and 20 characters";
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
            <form noValidate onSubmit={submitUsername}>
                <DialogContent>
                    <TextField
                        required
                        fullWidth
                        label="New Username"
                        value={updatedUsername}
                        error={!!errors.username}
                        helperText={errors.username}
                        onChange={(e) => setUpdatedUsername(e.target.value)}
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                    <Button variant="contained" type="submit">
                        Update
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default Settings;
