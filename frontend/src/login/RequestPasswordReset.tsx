import React, { FC, useState } from "react";
import { AxiosError } from "axios";
import { submitRequestPasswordResetAPI } from "@/api/AccountAPI";
import alert from "@/common/AlertDialog";
import { Button, Card, CardContent, Container, TextField, Box, Typography } from "@mui/material";

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
        try {
            const response = await submitRequestPasswordResetAPI(username);
            setIsWaiting(false);
            alert(
                `Password reset email sent to your email address at ${response.data.email}. Please check your main inbox and any spam folders for the email.`,
            );
        } catch (err) {
            setIsWaiting(false);
            alert(String((err as AxiosError).response?.data || "Password reset submission failed"));
        }
    };

    return (
        <Container maxWidth="sm" sx={{ my: 5, display: "flex", flexDirection: "column" }}>
            <Card>
                <CardContent>
                    <Typography variant="h4" component="h2" gutterBottom>
                        Request Password Reset
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            required
                            margin="normal"
                            placeholder="Username Or Email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{ my: 2 }}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            disabled={isWaiting}
                            sx={{ my: 2 }}
                        >
                            Request Password Reset
                        </Button>
                    </Box>
                </CardContent>
            </Card>
            <Button href="/login">Back</Button>
        </Container>
    );
};

export default RequestPasswordReset;
