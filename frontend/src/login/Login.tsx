import { useContext, useState } from "react";
import { AxiosError } from "axios";
import { AuthContext } from "@/common/AuthContext";
import {
    Button,
    Card,
    CardContent,
    Container,
    TextField,
    Stack,
    Typography,
    Link,
    Box,
} from "@mui/material";
import type { LoginDataType } from "@/types";
import { logger } from "@/common/logger";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [errors, setErrors] = useState<{
        username?: string;
        password?: string;
    }>({});

    const { login } = useContext(AuthContext);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors: {
            username?: string;
            password?: string;
        } = {};
        if (!username) {
            newErrors["username"] = "Username is required";
        }
        if (!password) {
            newErrors["password"] = "Password is required";
        }
        if (Object.keys(newErrors).length !== 0) {
            setErrors(newErrors);
            return;
        }

        const credentials: LoginDataType = { username, password };
        try {
            await login(credentials);
            logger.log("Login successful!");
        } catch (err) {
            setErrors({
                username: " ",
                password: (err as AxiosError).response?.data as string,
            });
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
                        <Stack component="form" noValidate onSubmit={handleSubmit}>
                            <Typography variant="h1">UBC Mahjong Club</Typography>

                            <TextField
                                fullWidth
                                required
                                label="Username or Email"
                                placeholder="Enter your username or email"
                                value={username}
                                error={!!errors.username}
                                helperText={errors.username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                            />

                            <TextField
                                fullWidth
                                required
                                label="Password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                error={!!errors.password}
                                helperText={errors.password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />

                            <Button fullWidth variant="contained" type="submit" size="large">
                                Login
                            </Button>

                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                justifyContent="space-between"
                                alignItems="center"
                                spacing={1}
                            >
                                <Typography variant="body2" color="text.secondary">
                                    Don&apos;t have an account?{" "}
                                    <Link href="/register" underline="hover" fontWeight={600}>
                                        Sign up
                                    </Link>
                                </Typography>
                                <Typography variant="body2">
                                    <Link
                                        href="/request-password-reset"
                                        underline="hover"
                                        fontWeight={600}
                                    >
                                        Forgot your password?
                                    </Link>
                                </Typography>
                            </Stack>
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

export default Login;
