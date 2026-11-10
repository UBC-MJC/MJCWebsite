import { Container, Link, Stack, Typography } from "@mui/material";

const Unauthorized = () => {
    return (
        <Container>
            <Stack spacing={2}>
                <Typography variant="h1">Unauthorized</Typography>
                <Typography>
                    You do not have permission to access this page. This may be because you are not
                    logged in or your account lacks the required permissions.
                </Typography>
                <Typography>
                    Please log in with an account that has the necessary access rights. If you
                    believe this is an error, contact your administrator.
                </Typography>
                <Typography>
                    <Link href="/">Return to Home</Link>
                </Typography>
            </Stack>
        </Container>
    );
};

export default Unauthorized;
