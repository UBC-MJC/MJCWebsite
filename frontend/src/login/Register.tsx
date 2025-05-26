import React, { useContext, useState } from "react";
import { AuthContext } from "../common/AuthContext";
import { AxiosError } from "axios";
import { Button, Card, Container, Stack, TextField, Typography, Box } from "@mui/material";

const isEmail = (email: string) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const Register: React.FC = () => {
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [errors, setErrors] = useState<any>({});

    const { register } = useContext(AuthContext);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors: any = {};
        if (!username) {
            newErrors["username"] = "Username is required";
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
                    password: err.response?.data,
                });
            });
    };

    return (
        <Container maxWidth="sm">
            <Card>
                <Typography gutterBottom>
                    UBC Mahjong Club Register
                </Typography>
                <Box component="form" noValidate onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <TextField
                            required
                            label="Username"
                            value={username}
                            error={Boolean(errors.username)}
                            helperText={errors.username}
                            onChange={(e) => setUsername(e.target.value)}
                            fullWidth
                        />

                        <Stack direction="row" spacing={2}>
                            <TextField
                                required
                                label="First name"
                                value={firstName}
                                error={Boolean(errors.firstName)}
                                helperText={errors.firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                fullWidth
                            />
                            <TextField
                                required
                                label="Last name"
                                value={lastName}
                                error={Boolean(errors.lastName)}
                                helperText={errors.lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                fullWidth
                            />
                        </Stack>

                        <TextField
                            required
                            label="Email"
                            type="email"
                            value={email}
                            error={Boolean(errors.email)}
                            helperText={errors.email}
                            onChange={(e) => setEmail(e.target.value)}
                            fullWidth
                        />

                        <TextField
                            required
                            label="Password"
                            type="password"
                            value={password}
                            error={Boolean(errors.password)}
                            helperText={errors.password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                        />

                        <Button variant="contained" type="submit">
                            Sign Up
                        </Button>

                        <Typography variant="body2">
                            Have an account? <a href="/login">Login</a>
                        </Typography>
                    </Stack>
                </Box>
            </Card>
            <Box mt={2} display="flex" justifyContent="center">
                <Button>Back</Button>
            </Box>
        </Container>
    );
};

export default Register;
