import React, { FC, useState } from "react";
import { AxiosError } from "axios";
import { submitRequestPasswordResetAPI } from "../api/AccountAPI";
import alert from "../common/AlertDialog";
import { Button, Card, CardContent, Container, TextField, Typography, Box } from "@mui/material";

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
        <Container>
            <Card>
                <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Request Password Reset
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            required
                            fullWidth
                            margin="normal"
                            label="Username Or Email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <Box mt={2}>
                            <Button
                                variant="contained"
                                type="submit"
                                disabled={isWaiting}
                                fullWidth
                            >
                                Request Password Reset
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
            <Box mt={2}>
                <Button fullWidth>Back</Button>
            </Box>
        </Container>
    );
};

export default RequestPasswordReset;
