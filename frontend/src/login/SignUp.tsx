import React, {useState} from "react";
import {signUp} from "../api/Login";
import {Button, Card, Container, Form, Row, Col} from "react-bootstrap";

const SignUp: React.FC = () => {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [validated, setValidated] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setValidated(true);

        const form = e.currentTarget;
        if (!form.checkValidity()) {
            return;
        }

        const credentials: signUpDataType = {username, firstName, lastName, email, password};
        signUp(credentials).then((res) => {
            console.log(res);
        }).catch((err) => {
            console.log(err.message)
        });
    };

    return (
        <Container className="my-5 d-flex flex-column" style={{maxWidth: "600px"}}>
            <Card body>
                <h2>UBC Mahjong Club Sign Up</h2>
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

                    <Row className="my-4">
                        <Form.Group as={Col} controlId="formBasicFirstName">
                            <Form.Control
                                type="text"
                                placeholder="First name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                            <Form.Text muted>
                                Optional
                            </Form.Text>
                        </Form.Group>
                        <Form.Group as={Col} controlId="formBasicLastName">
                            <Form.Control
                                type="text"
                                placeholder="Last name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                            <Form.Text muted>
                                Optional
                            </Form.Text>
                        </Form.Group>
                    </Row>

                    <Form.Group controlId="formBasicEmail" className="my-4">
                        <Form.Control
                            required
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Form.Control.Feedback type="invalid">
                            Please provide a valid email.
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
                            Please provide a valid password.
                        </Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-grid my-4">
                        <Button variant="primary" type="submit">
                            Sign Up
                        </Button>
                    </div>

                    <div className="d-flex justify-content-center mx-2">
                        <p>Have an account? <a href="/login">Login</a></p>
                    </div>
                </Form>
            </Card>
        </Container>
    );
}

export default SignUp;
