import React, {useContext, useState} from 'react';
import {Button, Container, Form, Card} from 'react-bootstrap';
import {AxiosError} from "axios";
import {AuthContext} from "../common/AuthContext";

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

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

        const credentials: LoginDataType = {username, password};
        login(credentials).then(() => {
            console.log("Login successful!");
        }).catch((err: AxiosError) => {
            setErrors({
                username: " ",
                password: err.response?.data
            });
        });
    };

    return (
        <Container className="my-5 d-flex flex-column" style={{maxWidth: "540px"}}>
            <Card body>
                <h2>UBC Mahjong Club Login</h2>
                <Form noValidate onSubmit={handleSubmit}>
                    <Form.Group controlId="formBasicUsername" className="my-4">
                        <Form.Control
                            required
                            placeholder="Username"
                            value={username}
                            isInvalid={errors.username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.username}
                        </Form.Control.Feedback>
                    </Form.Group>


                    <Form.Group controlId="formBasicPassword" className="my-4">
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

                    <div className="d-grid my-4">
                        <Button variant="primary" type="submit">
                            Login
                        </Button>
                    </div>

                    <div className="d-flex justify-content-between mx-2">
                        <p>Not a member? <a href="/register">Register</a></p>
                        <a href="/login">Forgot password?</a>
                    </div>
                </Form>
            </Card>
            <Button className="my-4 mx-auto w-25" variant="light" href="/">
                Back
            </Button>
        </Container>
    );
};


export default Login;
