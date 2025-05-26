import React, { useContext, useState } from "react";
import { Container, Form, Card } from "react-bootstrap";
import { AxiosError } from "axios";
import { AuthContext } from "../common/AuthContext";
import { Button } from "@mui/material";

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
        <Container>
            <Card body>
                <h2>UBC Mahjong Club Login</h2>
                <Form noValidate onSubmit={handleSubmit}>
                    <Form.Group controlId="formBasicUsername" >
                        <Form.Control
                            required
                            placeholder="Username or Email"
                            value={username}
                            isInvalid={errors.username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.username}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="formBasicPassword" >
                        <Form.Control
                            required
                            type="password"
                            placeholder="Password"
                            value={password}
                            isInvalid={errors.password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.password}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <div >
                        <Button variant="contained" type="submit">
                            Login
                        </Button>
                    </div>

                    <div >
                        <p>
                            Not a member? <a href="/register">Register</a>
                        </p>
                        <a href="/request-password-reset">Forgot password?</a>
                    </div>
                </Form>
            </Card>
            <Button >
                Back
            </Button>
        </Container>
    );
};

export default Login;
