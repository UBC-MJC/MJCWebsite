import { Box, Container, Typography } from "@mui/material";

import logo from "../assets/MJC square.png";

const Home = () => {
    return (
        <Container>
            <Typography variant="h1">Home</Typography>
            <Box component="img" src={logo} alt="UBC Mahjong Club Logo" sx={{ width: "50%" }} />
            <p>Club room location: Room 3206B, The Nest</p>
            <p>The University of British Columbia, Vancouver, BC</p>
            <p>
                Instagram:{" "}
                <a href={"https://www.instagram.com/ubcmahjongclub"} className="link">
                    ubcmahjongclub
                </a>
            </p>
            <p>Email: ubcmahjongclub@gmail.com </p>
            <p>
                <a href={"https://discord.gg/93mksWsQNB"} className="link">
                    Join our discord channel
                </a>{" "}
                for latest information!
            </p>
            <p>
                <a
                    href="https://docs.google.com/document/d/1JcCKNW-aOUuAdWWWS2mtQfiJNOOuArgwCL9lGysXDAY"
                    className="link"
                >
                    <b>Terms and conditions</b>
                </a>
            </p>
        </Container>
    );
};

export default Home;
