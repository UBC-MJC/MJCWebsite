import React, { FC, useState } from "react";
import { Card, Container, Form, Alert } from "react-bootstrap";
import { AxiosError } from "axios";
import { submitPasswordResetAPI } from "../api/AccountAPI";
import alert from "../common/AlertDialog";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

type PasswordResetProps = {
    playerId: string | null;
    token: string | null;
};

const PasswordReset: FC<PasswordResetProps> = ({ playerId, token }) => {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | undefined>(undefined);
    const [isWaiting, setIsWaiting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError(undefined);

        if (!password) {
            setError("Please enter a valid password.");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsWaiting(true);
        submitPasswordResetAPI(playerId!, token!, password)
            .then(() => {
                alert(`Password reset successfully. Please login with your new password.`);
            })
            .then(() => {
                navigate(`/login`);
            })
            .catch((err: AxiosError) => {
                setError(err.response?.data as string);
                setIsWaiting(false);
            });
    };

    if (!playerId || !token) {
        return (
            <Container className="my-5 d-flex flex-column" style={{ maxWidth: "540px" }}>
                <Card body>
                    <h2>Invalid Request</h2>
                    <p>The link you have requested has been expired.</p>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="my-5 d-flex flex-column" style={{ maxWidth: "540px" }}>
            <Card body>
                <h2>Reset Password</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form noValidate onSubmit={handleSubmit}>
                    <Form.Group controlId="formBasicPassword" className="my-4">
                        <Form.Control
                            required
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="formBasicConfirmPassword" className="my-4">
                        <Form.Control
                            required
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </Form.Group>

                    <div className="d-grid my-4">
                        <Button variant="contained" type="submit" disabled={isWaiting}>
                            Reset Password
                        </Button>
                    </div>
                </Form>
            </Card>
        </Container>
    );
};

export default PasswordReset;
