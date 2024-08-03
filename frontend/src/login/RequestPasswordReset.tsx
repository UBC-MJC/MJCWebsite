import React, { FC, useState } from "react";
import { Card, Container, Form } from "react-bootstrap";
import { AxiosError } from "axios";
import { submitRequestPasswordResetAPI } from "../api/AccountAPI";
import alert from "../common/AlertDialog";
import { Button } from "@mui/material";

const RequestPasswordReset: FC = () => {
    const [username, setUsername] = useState("");
    const [isWaiting, setIsWaiting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!username) {
            await alert("Username is required");
            return;
        }

        setIsWaiting(true);
        submitRequestPasswordResetAPI(username)
            .then((response) => {
                setIsWaiting(false);
                alert(
                    `Password reset email sent to your email address at ${response.data.email}. Please check your main inbox and any spam folders for the email.`,
                );
            })
            .catch((err: AxiosError) => {
                setIsWaiting(false);
                alert(err.response?.data);
            });
    };

    return (
        <Container className="my-5 d-flex flex-column" style={{ maxWidth: "540px" }}>
            <Card body>
                <h2>Request Password Reset</h2>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formBasicUsername" className="my-4">
                        <Form.Control
                            required
                            placeholder="Username Or Email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </Form.Group>

                    <div className="d-grid my-4">
                        <Button variant="contained" type="submit" disabled={isWaiting}>
                            Request Password Reset
                        </Button>
                    </div>
                </Form>
            </Card>
            <Button className="my-4 mx-auto w-25" href="/login">
                Back
            </Button>
        </Container>
    );
};

export default RequestPasswordReset;
