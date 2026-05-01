import {
    Container,
    Typography,
    Divider,
    Link,
    Stack,
    Paper,
    List,
    ListItem,
    Grid,
    ListItemText,
} from "@mui/material";

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
                        <Stack direction="row" justifyContent={"center"} spacing={4}>
                            <Stack>
                                <Typography variant="h3">Early Bird Registration Fee</Typography>
                                <Typography>50 CAD / 40 USD</Typography>
                            </Stack>
                            <Stack>
                                <Typography variant="h3">Regular Registration Fee</Typography>
                                <Typography>60 CAD / 48 USD</Typography>
                            </Stack>
                        </Stack>
                        <Typography variant="h3"> Prize Pool</Typography>
                        <Typography>
                            300 / 150 / 100 / 50 CAD (minimum, subject to increase)
                        </Typography>
                        <Typography variant="h3"> Payment Method</Typography>
                        <Typography>
                            For Canadian registrants, please e-transfer the corresponding amount to
                            ubcmahjongclub@gmail.com.
                        </Typography>
                        <Typography>
                            For non-Canadian registrants, please send the amount via PayPal to
                            zihaohuang2017 or julienhuang2009@sina.com.
                        </Typography>
                        <Typography>
                            A confirmation email will be sent to complete the registration process.
                        </Typography>
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
                            will also be observed. The format of the game will be 90 minutes + 0
                            round.
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
                        <Divider />
                        <Typography variant="h3"> Riichi Canada Certification</Typography>
                        <Typography>Obtained</Typography>
                        <Typography variant="h3">
                            American Riichi Association Certification
                        </Typography>
                        <Typography>Obtained</Typography>
                    </Stack>
                </Paper>
                <Paper elevation={3}>
                    <Stack spacing={2} p={2}>
                        <Typography variant="h2">Schedule</Typography>
                        <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12 }}>
                            <Grid size={6}>
                                <List>
                                    <ListItem>
                                        <b>Day 1 (2026-07-18)</b>
                                    </ListItem>

                                    <ListItem>10:00 &ndash; 10:30: Player Check-in</ListItem>
                                    <ListItem>10:30 &ndash; 12:00: Round 1</ListItem>
                                    <ListItem>12:15 &ndash; 13:45: Round 2</ListItem>
                                    <ListItem>13:45 &ndash; 15:00: Intermission + Lunch</ListItem>
                                    <ListItem>15:00 &ndash; 16:30: Round 3</ListItem>
                                    <ListItem>16:45 &ndash; 18:15: Round 4</ListItem>
                                    <ListItem>18:15 onwards: Free Play</ListItem>
                                </List>
                            </Grid>
                            <Grid size={6}>
                                <List>
                                    <ListItem>
                                        <b>Day 2 (2026-07-19)</b>
                                    </ListItem>

                                    <ListItem>10:00 &ndash; 10:30: Player Check-in</ListItem>
                                    <ListItem>10:30 &ndash; 12:00: Round 5</ListItem>
                                    <ListItem>12:15 &ndash; 13:45: Round 6</ListItem>
                                    <ListItem>13:45 &ndash; 15:00: Intermission + Lunch</ListItem>
                                    <ListItem>15:00 &ndash; 16:30: Playoff Game 1</ListItem>
                                    <ListItem>16:45 &ndash; 18:15: Playoff Game 2</ListItem>
                                    <ListItem>18:15 onwards: Awards Ceremony + Free Play</ListItem>
                                </List>
                            </Grid>
                        </Grid>
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
