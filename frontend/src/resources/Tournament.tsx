import { Container, Typography, Divider, Link, Stack, Paper } from "@mui/material";

export default function Tournament() {
    return (
        <Container maxWidth="md">
            <Typography variant="h1" fontWeight="bold">
                Vancouver Riichi Open 2026
            </Typography>
            <Stack spacing={3}>
                <Paper elevation={3}>
                    <Stack spacing={2} p={2}>
                        <Typography variant="h2">Location (Tentative)</Typography>
                        <Typography>
                            <strong>Room 2306/2309, AMS Student Nest</strong>
                            <br />
                            6133 University Blvd,
                            <br />
                            Vancouver, BC
                            <br />
                            V6T 1Z1
                        </Typography>

                        <Divider />

                        <Link href="https://docs.google.com/forms/d/e/1FAIpQLSeJOeW3Iv0nxAjwumpmyHGMQ7CupxZupP2xiBZqDi7ipkF53A/viewform?usp=publish-editor">
                            Registration Link
                        </Link>
                        <Typography variant="h3"> Early Bird Registration Closes</Typography>
                        <Typography>2026-06-14 (Sunday)</Typography>
                        <Typography variant="h3"> Registration Closes</Typography>
                        <Typography>2026-07-12 (Sunday)</Typography>
                        <Typography variant="h3"> Tournament Dates</Typography>
                        <Typography>2026-07-18 - 2026-07-19</Typography>
                    </Stack>
                </Paper>

                <Paper elevation={3}>
                    <Stack spacing={2} p={2}>
                        <Typography variant="h2">Fees & Prizes</Typography>
                        <Typography variant="h3"> Early Bird Registration Fee</Typography>
                        <Typography>50 CAD / 40 USD</Typography>
                        <Typography variant="h3"> Regular Registration Fee</Typography>
                        <Typography>60 CAD / 48 USD</Typography>
                        <Typography variant="h3"> Prize Pool</Typography>
                        <Typography>
                            300 / 150 / 100 / 50 CAD (minimum, subject to increase)
                        </Typography>

                        <Divider />
                        <Typography variant="h3"> Riichi Canada Certification</Typography>
                        <Typography>Obtained</Typography>
                        <Typography variant="h3">
                            {" "}
                            American Riichi Association Certification
                        </Typography>
                        <Typography>Intended, Application submitted</Typography>
                    </Stack>
                </Paper>

                <Paper elevation={3}>
                    <Stack spacing={2} p={2}>
                        <Typography variant="h2">Rules and Format</Typography>
                        <Typography variant="body1">
                            The tournament will follow the{" "}
                            <Link href="https://www.worldriichi.org/s/WRC-Rules-2025-42fx.pdf">
                                WRC 2025 rules
                            </Link>{" "}
                            with the modification of optional rule 2.1 (Red Fives), 3.2 (Nagashi
                            Mangan) and 4.1 (Uma: 30/10/-10/-30).{" "}
                            <Link href="https://docs.google.com/document/d/1B7NfQbeUtitvm9pBoblBFhCViq5YSWmI9fyJgcn8kFk/">
                                Riichi General Etiquette
                            </Link>{" "}
                            will also be observed.
                        </Typography>
                        <Divider />
                        <Typography variant="subtitle1" fontWeight="bold">
                            Tournament Structure (8 Games total across 2 days):
                        </Typography>
                        <Typography>Game 1-6 will be played by everyone.</Typography>
                        <Typography>
                            Game 7 (Playoff Game 1) will be played by the top 8 with seating as ([1,
                            4, 5, 8], [2, 3, 6, 7]).
                        </Typography>
                        <Typography>
                            Game 8 (Playoff Game 2) will be played by the top 8 with seating as ([1,
                            3, 5, 7], [2, 4, 6, 8]).
                        </Typography>
                    </Stack>
                </Paper>

                <Paper elevation={3}>
                    <Stack spacing={2} p={2}>
                        <Typography variant="h2">Additional Information</Typography>

                        <Typography variant="h3">Capacity</Typography>
                        <Typography>
                            Maximum capacity: 48 (subject to change). Late registrants will be
                            placed on a waitlist.
                        </Typography>

                        <Typography variant="h3">Meals</Typography>
                        <Typography>
                            No meals provided. Dedicated lunch time is allocated. Several food
                            options are available around campus. Bottled Water and Snacks will be
                            provided.
                        </Typography>

                        <Typography variant="h3">Refund Policy</Typography>
                        <Typography>
                            Refunds issued for emergencies only. Contact us to request a withdrawal
                            and refund.
                        </Typography>
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}
