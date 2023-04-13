import React, {useState} from 'react';
import {Button, Container, Form, Card} from 'react-bootstrap';
import {login} from "../api/Login";
import {AxiosError} from "axios";

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [validated, setValidated] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setValidated(true);

        const form = e.currentTarget;
        if (!form.checkValidity()) {
            return;
        }

        const credentials: loginDataType = {username, password};
        login(credentials).then((res) => {
            console.log(res);
        }).catch((err: AxiosError) => {
            console.log(err.message)
        });
    };

    return (
        <Container className="my-5 d-flex flex-column" style={{maxWidth: "540px"}}>
            <Card body>
                <h2>UBC Mahjong Club Login</h2>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Form.Group controlId="formBasicUsername" className="my-4">
                        <Form.Control
                            required
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a username.
                        </Form.Control.Feedback>
                    </Form.Group>


                    <Form.Group controlId="formBasicPassword" className="my-4">
                        <Form.Control
                            required
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a password.
                        </Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-grid my-4">
                        <Button variant="primary" type="submit">
                            Login
                        </Button>
                    </div>

                    <div className="d-flex justify-content-between mx-2">
                        <p>Not a member? <a href="/signup">Register</a></p>
                        <a href="/login">Forgot password?</a>
                    </div>
                </Form>
            </Card>
        </Container>
    );
};


export default Login;
