import React, { useContext, useState } from "react";
import { AxiosError } from "axios";
import { AuthContext } from "@/common/AuthContext";
import { Button, Card, CardContent, Container, TextField, Box, Typography } from "@mui/material";
import type { LoginDataType } from "@/types";
import { logger } from "@/common/logger";

const Login: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [errors, setErrors] = useState<{
        username?: string;
        password?: string;
    }>({});

    const { login } = useContext(AuthContext);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
        login(credentials)
            .then(() => {
                logger.log("Login successful!");
            })
            .catch((err: AxiosError) => {
                setErrors({
                    username: " ",
                    password: err.response?.data as string,
                });
            });
    };

    return (
        <Container maxWidth="sm" sx={{ my: 5, display: "flex", flexDirection: "column" }}>
            <Card>
                <CardContent>
                    <Typography variant="h4" component="h2" gutterBottom>
                        UBC Mahjong Club Login
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            required
                            margin="normal"
                            placeholder="Username or Email"
                            value={username}
                            error={!!errors.username}
                            helperText={errors.username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{ my: 2 }}
                        />

                        <TextField
                            fullWidth
                            required
                            margin="normal"
                            type="password"
                            placeholder="Password"
                            value={password}
                            error={!!errors.password}
                            helperText={errors.password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ my: 2 }}
                        />

                        <Button fullWidth variant="contained" type="submit" sx={{ my: 2 }}>
                            Login
                        </Button>

                        <Box sx={{ display: "flex", justifyContent: "space-between", mx: 1 }}>
                            <Typography variant="body2">
                                Not a member? <a href="/register">Register</a>
                            </Typography>
                            <Typography variant="body2">
                                <a href="/request-password-reset">Forgot password?</a>
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
            <Button href="/">Back</Button>
        </Container>
    );
};

export default Login;
