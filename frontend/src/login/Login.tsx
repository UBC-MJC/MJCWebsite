import React, {useState} from 'react';
import {Button, Container, Form, Card} from 'react-bootstrap';
import {login} from "../api/Login";

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        login(email, password).then((res) => {
            console.log(res);
        }).catch((err) => {
            console.error(err);
        });
    };

    return (
        <Container className="my-5 d-flex flex-column" style={{maxWidth: "540px"}}>
            <Card body>
                <h1>UBC Mahjong Club Login</h1>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formBasicEmail" className="my-4">
                        <Form.Control
                            type="email"
                            placeholder="Username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="formBasicPassword" className="my-4">
                        <Form.Control
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Group>

                    <div className="d-grid my-4">
                        <Button variant="primary" type="submit">
                            Login
                        </Button>
                    </div>

                    <div className="d-flex justify-content-between mx-2">
                        <p>Not a member? <a href="/">Register</a></p>
                        <a href="/">Forgot password?</a>
                    </div>
                </Form>
            </Card>
        </Container>
    );
};


export default Login;
