import { useState } from "react";
import { AxiosError } from "axios";
import { submitRequestPasswordResetAPI } from "@/api/AccountAPI";
import alert from "@/common/AlertDialog";
import {
    Button,
    Card,
    CardContent,
    Container,
    TextField,
    Stack,
    Typography,
    Box,
    Link,
} from "@mui/material";

const RequestPasswordReset = () => {
    const [username, setUsername] = useState("");
    const [isWaiting, setIsWaiting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!username) {
            await alert("Username is required");
            return;
        }

        setIsWaiting(true);
        try {
            const response = await submitRequestPasswordResetAPI(username);
            setIsWaiting(false);
            alert(
                `Password reset email sent to your email address at ${response.data.email}. Please check your main inbox and any spam folders for the email.`,
            );
        } catch (err) {
            setIsWaiting(false);
            alert(String((err as AxiosError).response?.data || "Password reset submission failed"));
        }
    };

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
                        <Stack component="form" onSubmit={handleSubmit}>
                            <Stack spacing={1}>
                                <Typography variant="h2" component="h1">
                                    Reset Your Password
                                </Typography>
                                <Typography variant="body2" align="center" color="text.secondary">
                                    Enter your username or email and we&apos;ll send you a link to
                                    reset your password.
                                </Typography>
                            </Stack>

                            <TextField
                                fullWidth
                                required
                                label="Username or Email"
                                placeholder="Enter your username or email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                type="submit"
                                size="large"
                                disabled={isWaiting}
                            >
                                {isWaiting ? "Sending..." : "Send Reset Link"}
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

export default RequestPasswordReset;
