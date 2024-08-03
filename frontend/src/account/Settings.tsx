import React, { FC, useContext, useState } from "react";
import { AuthContext } from "../common/AuthContext";
import { Container, Col } from "react-bootstrap";
import { updateSettingsAPI } from "../api/AccountAPI";
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
            .then(() => {
                // do nothing
            })
            .catch((error: AxiosError) => {
                console.log("Error updating settings: ", error.response?.data);
            });
    };

    if (typeof player === "undefined") {
        return <h1>Not Logged In</h1>;
    }
    const colorMode = React.useContext(ColorModeContext);

    return (
        <Container fluid className={"my-4"}>
            <h1>Settings</h1>
            <Col xs sm={3} className="mx-auto">
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
        </Container>
    );
};

export default Settings;
