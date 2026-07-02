import { useContext, useState } from "react";
import { AuthContext } from "@/common/AuthContext";
import { AxiosError } from "axios";
import {
    Button,
    Card,
    CardContent,
    TextField,
    Stack,
    Typography,
    Grid,
    Link,
    Box,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { RegisterDataType } from "@/types";
import { logger } from "@/common/logger";
import AuthLayout from "./AuthLayout";
import BrandHeader from "./BrandHeader";

const isEmail = (email: string) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const Register = () => {
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [errors, setErrors] = useState<Record<string, string>>({});

    const { register } = useContext(AuthContext);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};
        if (!username || username.trim().length === 0) {
            newErrors["username"] = "Username is required (no whitespace only)";
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
        if (!password) {
            newErrors["password"] = "Password is required";
        } else if (password.length < 6) {
            newErrors["password"] = "Password must be at least 6 characters long";
        }
        if (!confirmPassword) {
            newErrors["confirmPassword"] = "Please confirm your password";
        } else if (password !== confirmPassword) {
            newErrors["confirmPassword"] = "Passwords do not match";
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
        try {
            await register(credentials);
            logger.log("Registration successful!");
        } catch (err) {
            setErrors({
                password: String((err as AxiosError).response?.data || "Registration failed"),
            });
        }
    };

    return (
        <AuthLayout maxWidth="sm">
            <BrandHeader subtitle="Create an account to record games and track your rating" />

            <Card>
                <CardContent sx={{ p: 3 }}>
                    <Stack component="form" noValidate onSubmit={handleSubmit} spacing={2}>
                        <TextField
                            fullWidth
                            required
                            label="Username"
                            placeholder="Choose a username"
                            value={username}
                            error={!!errors.username}
                            helperText={errors.username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                        />

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="First Name"
                                    placeholder="Enter your first name"
                                    value={firstName}
                                    error={!!errors.firstName}
                                    helperText={errors.firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    autoComplete="given-name"
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Last Name"
                                    placeholder="Enter your last name"
                                    value={lastName}
                                    error={!!errors.lastName}
                                    helperText={errors.lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    autoComplete="family-name"
                                />
                            </Grid>
                        </Grid>

                        <TextField
                            fullWidth
                            required
                            label="Email"
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            error={!!errors.email}
                            helperText={errors.email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                        />

                        <TextField
                            fullWidth
                            required
                            label="Password"
                            type="password"
                            placeholder="Create a password (min 6 characters)"
                            value={password}
                            error={!!errors.password}
                            helperText={errors.password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                        />

                        <TextField
                            fullWidth
                            required
                            label="Confirm Password"
                            type="password"
                            placeholder="Re-enter your password"
                            value={confirmPassword}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                        />

                        <Button fullWidth variant="contained" type="submit" size="large">
                            Sign Up
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                    Already have an account?{" "}
                    <Link component={RouterLink} to="/login" underline="hover" fontWeight={600}>
                        Login
                    </Link>
                </Typography>
            </Box>
        </AuthLayout>
    );
};

export default Register;
