import React, { FC } from "react";
import {
    Container,
    Typography
} from "@mui/material";

export const GameNotFound: FC = () => {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1">
                Game Not Found
            </Typography>
        </Container>
    );
}