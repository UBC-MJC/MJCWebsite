import { useContext, useState } from "react";
import { AxiosError } from "axios";
import { AuthContext } from "@/common/AuthContext";
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Divider,
    InputAdornment,
    Link,
    Stack,
    TextField,
    Typography,
    IconButton,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { Link as RouterLink } from "react-router-dom";
import type { LoginDataType } from "@/types";
import { logger } from "@/common/logger";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newErrors: typeof errors = {};
        if (!username) newErrors.username = "Username is required";
        if (!password) newErrors.password = "Password is required";
        if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

        try {
            await login({ username, password } as LoginDataType);
            logger.log("Login successful!");
        } catch (err) {
            setErrors({ username: " ", password: (err as AxiosError).response?.data as string });
        }
    };

    return (
        <Container
            maxWidth="xs"
            sx={{ minHeight: "100dvh", display: "flex", flexDirection: "column", justifyContent: "center", py: 4 }}
        >
            <Stack spacing={3}>
                {/* Brand */}
                <Box textAlign="center">
                    <Box
                        sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 3,
                            bgcolor: "primary.main",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mx: "auto",
                            mb: 2,
                        }}
                    >
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                            <rect x="2" y="2" width="11" height="11" rx="2" fill="white" />
                            <rect x="15" y="2" width="11" height="11" rx="2" fill="white" opacity="0.5" />
                            <rect x="2" y="15" width="11" height="11" rx="2" fill="white" opacity="0.5" />
                            <rect x="15" y="15" width="11" height="11" rx="2" fill="white" />
                        </svg>
                    </Box>
                    <Typography variant="h3" fontWeight={700} gutterBottom>
                        UBC Mahjong Club
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Sign in to record games and track your rating
                    </Typography>
                </Box>

                <Card>
                    <CardContent sx={{ p: 3 }}>
                        <Stack component="form" noValidate onSubmit={handleSubmit} spacing={2}>
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
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonOutlineIcon fontSize="small" sx={{ color: "text.disabled" }} />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <TextField
                                fullWidth
                                required
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                error={!!errors.password}
                                helperText={errors.password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockOutlinedIcon fontSize="small" sx={{ color: "text.disabled" }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    size="small"
                                                    aria-label="toggle password visibility"
                                                >
                                                    {showPassword ? (
                                                        <VisibilityOffOutlinedIcon fontSize="small" />
                                                    ) : (
                                                        <VisibilityOutlinedIcon fontSize="small" />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <Box display="flex" justifyContent="flex-end">
                                <Link
                                    component={RouterLink}
                                    to="/request-password-reset"
                                    variant="caption"
                                    underline="hover"
                                    color="primary"
                                >
                                    Forgot password?
                                </Link>
                            </Box>

                            <Button fullWidth variant="contained" type="submit" size="large">
                                Sign in
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>

                <Box textAlign="center">
                    <Typography variant="body2" color="text.secondary">
                        Don&apos;t have an account?{" "}
                        <Link component={RouterLink} to="/register" underline="hover" fontWeight={600}>
                            Create account
                        </Link>
                    </Typography>
                </Box>

                <Divider>
                    <Typography variant="caption" color="text.disabled">
                        or
                    </Typography>
                </Divider>

                <Box display="flex" justifyContent="center">
                    <Button component={RouterLink} to="/" variant="text" size="small" color="inherit" sx={{ color: "text.secondary" }}>
                        ← Back to home
                    </Button>
                </Box>
            </Stack>
        </Container>
    );
};

export default Login;
