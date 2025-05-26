import React, { useContext, useState } from "react";
import { AxiosError } from "axios";
import { AuthContext } from "../common/AuthContext";
import {
    Container,
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Link,
} from "@mui/material";

const Login: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<any>({});

    const { login } = useContext(AuthContext);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newErrors: any = {};
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
                console.log("Login successful!");
            })
            .catch((err: AxiosError) => {
                setErrors({
                    username: " ",
                    password: err.response?.data,
                });
            });
    };

    return (
        <Container maxWidth="sm">
            <Card>
                <CardContent>
                    <Typography component="h2" gutterBottom>
                        UBC Mahjong Club Login
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            margin="normal"
                            required
                            label="Username or Email"
                            value={username}
                            error={Boolean(errors.username)}
                            helperText={errors.username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            required
                            type="password"
                            label="Password"
                            value={password}
                            error={Boolean(errors.password)}
                            helperText={errors.password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Box mt={2} mb={2}>
                            <Button variant="contained" type="submit" fullWidth>
                                Login
                            </Button>
                        </Box>
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <Typography variant="body2">
                                Not a member?{" "}
                                <Link href="/register" underline="hover">
                                    Register
                                </Link>
                            </Typography>
                            <Link href="/request-password-reset" underline="hover" variant="body2">
                                Forgot password?
                            </Link>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
            <Box mt={2} display="flex" justifyContent="center">
                <Button variant="outlined" href="/">
                    Back
                </Button>
            </Box>
        </Container>
    );
};

export default Login;
