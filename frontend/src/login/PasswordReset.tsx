import React, { FC, useState } from "react";
import { Button, Card, Container, Form } from "react-bootstrap";
import { AxiosError } from "axios";
import { submitPasswordResetAPI } from "../api/AccountAPI";
import alert from "../common/AlertDialog";

const PasswordReset: FC = () => {
    const [username, setUsername] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!username) {
            await alert("Username is required");
            return
        }

        submitPasswordResetAPI(username)
            .then(() => {
                console.log("Email successful!");
                setSuccess(true);
            })
            .catch((err: AxiosError) => {
                alert(err.response?.data);
            });
    };

    return (
        <Container className="my-5 d-flex flex-column" style={{ maxWidth: "540px" }}>
            <Card body>
                <h2>Password Reset</h2>
                <Form noValidate onSubmit={handleSubmit}>
                    <Form.Group controlId="formBasicUsername" className="my-4">
                        <Form.Control
                            required
                            placeholder="Username Or Email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </Form.Group>

                    <div className="d-grid my-4">
                        <Button variant="primary" type="submit">
                            Reset Password
                        </Button>
                    </div>
                </Form>
            </Card>
            <Button className="my-4 mx-auto w-25" variant="light" href="/login">
                Back
            </Button>
        </Container>
    );
}

export default PasswordReset;
