import React, {useContext, useState} from "react";
import {Button, Card, Container, Form, Row, Col} from "react-bootstrap";
import {AuthContext} from "../common/AuthContext";
import {AxiosError} from "axios";

const isEmail = (email: string) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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
        if (!email) {
            newErrors["email"] = "Email is required";
        } else if (!isEmail(email)) {
            newErrors["email"] = "Email is invalid";
        }
        if (Object.keys(newErrors).length !== 0) {
            setErrors(newErrors);
            return;
        }

        const credentials: RegisterDataType = {username, firstName, lastName, email, password};
        register(credentials).then(() => {
            console.log("Registration successful!");
        }).catch((err: AxiosError) => {
            setErrors({
                password: err.response?.data
            });
        });
    };

    return (
        <Container className="my-5 d-flex flex-column" style={{maxWidth: "600px"}}>
            <Card body>
                <h2>UBC Mahjong Club Register</h2>
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
                            isInvalid={errors.email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.email}
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
                                Sign Up
                        </Button>
                    </div>

                    <div className="d-flex justify-content-center mx-2">
                        <p>Have an account? <a href="/login">Login</a></p>
                    </div>
                </Form>
            </Card>
            <Button className="my-4 mx-auto w-25" variant="light" href="/login">
                Back
            </Button>
        </Container>
    );
}

export default Register;
