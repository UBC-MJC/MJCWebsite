import { Box, Container, Typography, Link } from "@mui/material";

import logo from "../assets/MJC square.png";

const Home = () => {
    return (
        <Container>
            <Typography variant="h1">Home</Typography>
            <Box component="img" src={logo} alt="UBC Mahjong Club Logo" sx={{ width: "50%" }} />
            <p>
                <Link href="/vro2026">Register for the Vancouver Riichi Open 2026!</Link>
            </p>
            <p>Club room location: Room 3206B, The Nest</p>
            <p>The University of British Columbia, Vancouver, BC</p>
            <p>
                Instagram:{" "}
                <Link href={"https://www.instagram.com/ubcmahjongclub"}>ubcmahjongclub</Link>
            </p>
            <p>Email: ubcmahjongclub@gmail.com </p>
            <p>
                <Link href={"https://discord.gg/93mksWsQNB"}>Join our discord channel</Link> for
                latest information!
            </p>
            <p>
                <Link href="https://docs.google.com/document/d/1JcCKNW-aOUuAdWWWS2mtQfiJNOOuArgwCL9lGysXDAY">
                    <b>Terms and conditions</b>
                </Link>
            </p>
        </Container>
    );
};

export default Home;
