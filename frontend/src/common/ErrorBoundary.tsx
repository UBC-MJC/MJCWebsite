import React, { Component, ErrorInfo, ReactNode } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { logger } from "./logger";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        logger.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <Container maxWidth="md">
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        alignItems="center"
                        minHeight="100vh"
                        textAlign="center"
                        gap={2}
                    >
                        <Typography variant="h3" component="h1">
                            Something went wrong
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {this.state.error?.message || "An unexpected error occurred"}
                        </Typography>
                        <Box display="flex" gap={2} mt={2}>
                            <Button variant="contained" onClick={this.handleReset}>
                                Try Again
                            </Button>
                            <Button variant="outlined" onClick={() => (window.location.href = "/")}>
                                Go Home
                            </Button>
                        </Box>
                    </Box>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
