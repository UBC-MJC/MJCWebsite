import { Box, Button, Container, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

interface AuthLayoutProps {
    /** Width of the centered column — "xs" for sign-in, "sm" for the wider forms. */
    maxWidth?: "xs" | "sm";
    children: React.ReactNode;
}

/**
 * Shared shell for the auth pages (login, register, password reset): a vertically
 * centered, full-height column capped at `maxWidth`, with a muted "Back to home"
 * link beneath the content.
 */
const AuthLayout = ({ maxWidth = "sm", children }: AuthLayoutProps) => (
    <Container
        maxWidth={maxWidth}
        sx={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            py: 4,
        }}
    >
        <Stack spacing={3}>
            {children}
            <Box display="flex" justifyContent="center">
                <Button
                    component={RouterLink}
                    to="/"
                    variant="text"
                    size="small"
                    color="inherit"
                    sx={{ color: "text.secondary" }}
                >
                    ← Back to home
                </Button>
            </Box>
        </Stack>
    </Container>
);

export default AuthLayout;
