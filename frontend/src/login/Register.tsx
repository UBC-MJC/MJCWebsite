import React, { useContext, useState } from "react";
import { AuthContext } from "@/common/AuthContext";
import { AxiosError } from "axios";
import {
    Button,
    Card,
    CardContent,
    Container,
    TextField,
    Box,
    Typography,
    Grid,
} from "@mui/material";
import type { RegisterDataType } from "@/types";

const isEmail = (email: string) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const Register: React.FC = () => {
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [errors, setErrors] = useState<Record<string, string>>({});

    const { register } = useContext(AuthContext);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};
        if (!username || username.trim().length === 0) {
            newErrors["username"] = "Username is required (no whitespace only)";
        }
        if (!password) {
            newErrors["password"] = "Password is required";
        }
        if (!firstName) {
            newErrors["firstName"] = "First name is required";
        }
        if (!lastName) {
            newErrors["lastName"] = "Last name is required";
        }
        if (!email) {
            newErrors["email"] = "Email is required";
        } else if (!isEmail(email)) {
            newErrors["email"] = "Email is invalid";
        }
        if (Object.keys(newErrors).length !== 0) {
            setErrors(newErrors);
            return;
        }

        const credentials: RegisterDataType = {
            username,
            firstName,
            lastName,
            email,
            password,
        };
        register(credentials)
            .then(() => {
                console.log("Registration successful!");
            })
            .catch((err: AxiosError) => {
                setErrors({
                    password: String(err.response?.data || "Registration failed"),
                });
            });
    };

    return (
        <Container maxWidth="sm" sx={{ my: 5, display: "flex", flexDirection: "column" }}>
            <Card>
                <CardContent>
                    <Typography variant="h4" component="h2" gutterBottom>
                        UBC Mahjong Club Register
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            required
                            margin="normal"
                            placeholder="Username"
                            value={username}
                            error={!!errors.username}
                            helperText={errors.username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{ my: 2 }}
                        />

                        <Grid container spacing={2} sx={{ my: 2 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    type="text"
                                    placeholder="First name"
                                    value={firstName}
                                    error={!!errors.firstName}
                                    helperText={errors.firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    type="text"
                                    placeholder="Last name"
                                    value={lastName}
                                    error={!!errors.lastName}
                                    helperText={errors.lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </Grid>
                        </Grid>

                        <TextField
                            fullWidth
                            required
                            margin="normal"
                            type="email"
                            placeholder="Email"
                            value={email}
                            error={!!errors.email}
                            helperText={errors.email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            Sign Up
                        </Button>

                        <Box sx={{ display: "flex", justifyContent: "center", mx: 1 }}>
                            <Typography variant="body2">
                                Have an account? <a href="/login">Login</a>
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
            <Button href="/login">Back</Button>
        </Container>
    );
};

export default Register;
