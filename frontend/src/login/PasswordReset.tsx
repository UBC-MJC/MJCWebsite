import React, { FC, useState } from "react";
import { AxiosError } from "axios";
import { submitPasswordResetAPI } from "@/api/AccountAPI";
import alert from "@/common/AlertDialog";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Card,
    CardContent,
    Container,
    TextField,
    Box,
    Typography,
    Alert,
} from "@mui/material";

interface PasswordResetProps {
    playerId: string | null;
    token: string | null;
}

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
            <Container maxWidth="sm" sx={{ my: 5, display: "flex", flexDirection: "column" }}>
                <Card>
                    <CardContent>
                        <Typography variant="h4" component="h2" gutterBottom>
                            Invalid Request
                        </Typography>
                        <Typography variant="body1">
                            The link you have requested has been expired.
                        </Typography>
                    </CardContent>
                </Card>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ my: 5, display: "flex", flexDirection: "column" }}>
            <Card>
                <CardContent>
                    <Typography variant="h4" component="h2" gutterBottom>
                        Reset Password
                    </Typography>
                    {error && (
                        <Alert severity="error" variant="standard" sx={{ my: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Box component="form" noValidate onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            required
                            margin="normal"
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ my: 2 }}
                        />

                        <TextField
                            fullWidth
                            required
                            margin="normal"
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            sx={{ my: 2 }}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            disabled={isWaiting}
                            sx={{ my: 2 }}
                        >
                            Reset Password
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default PasswordReset;
