import { useState } from "react";
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
    Stack,
    Typography,
    Alert,
    Box,
    Link,
} from "@mui/material";

interface PasswordResetProps {
    playerId: string | null;
    token: string | null;
}

const PasswordReset = ({ playerId, token }: PasswordResetProps) => {
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
        try {
            await submitPasswordResetAPI(playerId!, token!, password);
            alert(`Password reset successfully. Please login with your new password.`);
            navigate(`/login`);
        } catch (err) {
            setError((err as AxiosError).response?.data as string);
            setIsWaiting(false);
        }
    };

    if (!playerId || !token) {
        return (
            <Container
                maxWidth="sm"
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                }}
            >
                <Stack spacing={2}>
                    <Card>
                        <CardContent>
                            <Stack spacing={2} alignItems="center">
                                <Typography variant="h2" component="h1" align="center">
                                    Invalid Request
                                </Typography>
                                <Typography variant="body1" align="center" color="text.secondary">
                                    The password reset link has expired or is invalid.
                                </Typography>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Box display="flex" justifyContent="center">
                        <Button href="/request-password-reset" variant="text">
                            Request a new reset link
                        </Button>
                    </Box>
                </Stack>
            </Container>
        );
    }

    return (
        <Container
            maxWidth="sm"
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
            }}
        >
            <Stack>
                <Card>
                    <CardContent>
                        <Stack component="form" noValidate onSubmit={handleSubmit}>
                            <Typography variant="h2" component="h1">
                                Reset Password
                            </Typography>

                            {error && (
                                <Alert severity="error" variant="standard">
                                    {error}
                                </Alert>
                            )}

                            <TextField
                                fullWidth
                                required
                                label="New Password"
                                type="password"
                                placeholder="Enter your new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                            />

                            <TextField
                                fullWidth
                                required
                                label="Confirm Password"
                                type="password"
                                placeholder="Re-enter your new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="new-password"
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                type="submit"
                                size="large"
                                disabled={isWaiting}
                            >
                                {isWaiting ? "Resetting..." : "Reset Password"}
                            </Button>

                            <Box display="flex" justifyContent="center">
                                <Typography variant="body2" color="text.secondary">
                                    Remember your password?{" "}
                                    <Link href="/login" underline="hover" fontWeight={600}>
                                        Login
                                    </Link>
                                </Typography>
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>

                <Box display="flex" justifyContent="center">
                    <Button href="/" variant="text">
                        Back to Home
                    </Button>
                </Box>
            </Stack>
        </Container>
    );
};

export default PasswordReset;
