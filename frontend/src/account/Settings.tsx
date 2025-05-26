import React, { FC, useContext, useState } from "react";
import { AuthContext } from "../common/AuthContext";
import { Container, Col, Row, Modal, Form } from "react-bootstrap";
import { updateSettingsAPI, updateUsernameAPI } from "../api/AccountAPI";
import { AxiosError } from "axios";
import { ButtonGroup, Button, FormControlLabel, Switch } from "@mui/material";
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
        <Container>
            <h1>Settings</h1>
            <Col xs sm={3} >
                <FormControlLabel
                    label="Legacy Display Game"
                    defaultChecked={settings.legacyDisplayGame}
                    control={
                        <Switch
                            onChange={(e, checked) => handleToggle(checked, "legacyDisplayGame")}
                        />
                    }
                />
            </Col>
            <ButtonGroup variant="contained" aria-label="Basic button group">
                <Button onClick={() => colorMode.toggleColorMode("light")}>Light</Button>
                <Button onClick={() => colorMode.toggleColorMode("dark")}>Dark</Button>
                <Button onClick={() => colorMode.toggleColorMode("system")}>System</Button>
            </ButtonGroup>
            <Row >
                <Button
                    onClick={() => setShowUpdateUsernameModal(true)}
                    variant="contained"
                    style={{ maxWidth: "200px" }}
                >
                    Update Username
                </Button>
            </Row>
            <UpdateUsernameModal
                show={showUpdateUsernameModal}
                handleClose={() => setShowUpdateUsernameModal(false)}
                handleSubmit={updateUsername}
            />
        </Container>
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
            console.log("asdasd");
            newErrors["username"] = "Username must be between 2 and 20 characters";
        }

        return newErrors;
    };

    const onClose = () => {
        setUpdatedUsername("");
        handleClose();
    };

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Update Username</Modal.Title>
            </Modal.Header>
            <Form noValidate onSubmit={submitUsername}>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Season Name</Form.Label>
                        <Form.Control
                            required
                            size="lg"
                            type="text"
                            placeholder="New Username"
                            defaultValue={""}
                            isInvalid={!!errors.username}
                            onChange={(e) => setUpdatedUsername(e.target.value)}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.username}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={onClose}>
                        Close
                    </Button>
                    <Button variant="contained" type="submit">
                        Update
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default Settings;
