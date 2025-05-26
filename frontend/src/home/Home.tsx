import { FC } from "react";

import logo from "../assets/MJC square.png";

const Home: FC = () => {
    return (
        <div>
            <h1>Home</h1>
            <h2>
                Register for <a href="https://forms.gle/sw9CnSsokeyJB6pK6">Vancouver Riichi Open</a>{" "}
                today!
            </h2>
            <img src={logo} />
            <p>Club room location: Room 3206B, The Nest</p>
            <p>The University of British Columbia, Vancouver, BC</p>
            <p>
                Instagram: <a href={"https://www.instagram.com/ubcmahjongclub"}>ubcmahjongclub</a>
            </p>
            <p>Email: ubcmahjongclub@gmail.com </p>
            <p>
                <a href={"https://discord.gg/93mksWsQNB"}>Join our discord channel</a> for latest
                information!
            </p>
            <p>
                <a href="https://docs.google.com/document/d/1JcCKNW-aOUuAdWWWS2mtQfiJNOOuArgwCL9lGysXDAY">
                    <b>Terms and conditions</b>
                </a>
            </p>
        </div>
    );
};

export default Home;
