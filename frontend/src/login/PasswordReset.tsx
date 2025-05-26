import React, { FC, useState } from "react";
import { AxiosError } from "axios";
import { submitPasswordResetAPI } from "../api/AccountAPI";
import alert from "../common/AlertDialog";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Card,
    CardContent,
    Typography,
    TextField,
    Alert,
    Button,
    Box,
} from "@mui/material";

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
            <Container maxWidth="sm">
                <Card>
                    <CardContent>
                        <Typography gutterBottom>
                            Invalid Request
                        </Typography>
                        <Typography>The link you have requested has been expired.</Typography>
                    </CardContent>
                </Card>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm">
            <Card>
                <CardContent>
                    <Typography gutterBottom>
                        Reset Password
                    </Typography>
                    {error && <Alert severity="error">{error}</Alert>}
                    <Box component="form" noValidate onSubmit={handleSubmit}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            type="password"
                            label="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            type="password"
                            label="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                        <Box>
                            <Button
                                variant="contained"
                                type="submit"
                                disabled={isWaiting}
                                fullWidth
                            >
                                Reset Password
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default PasswordReset;
