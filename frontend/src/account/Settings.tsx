import { ChangeEvent, FC, useContext, useState } from "react";
import { AuthContext } from "../common/AuthContext";
import { Container, Form, Col } from "react-bootstrap";
import { updateSettingsAPI } from "../api/AccountAPI";
import { AxiosError } from "axios";

const Settings: FC = () => {
    const { player, reloadPlayer } = useContext(AuthContext);

    const [settings, setSettings] = useState<Setting>((): Setting => {
        return {
            legacyDisplayGame: player!.legacyDisplayGame,
        };
    });

    const handleToggle = async (e: ChangeEvent<HTMLInputElement>, setting: string) => {
        const newSettings: Setting = {
            ...settings,
            [setting]: e.target.checked,
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

    return (
        <Container fluid>
            <h1>Settings</h1>
            <Col xs sm={3} className="mx-auto">
                <Form>
                    <Form.Switch
                        label="Legacy Display Game"
                        defaultChecked={settings.legacyDisplayGame}
                        onChange={(e) => handleToggle(e, "legacyDisplayGame")}
                    />
                </Form>
            </Col>
        </Container>
    );
};

export default Settings;
