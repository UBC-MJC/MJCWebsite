import { FC } from "react";
import { Image } from "react-bootstrap";
import logo from "../assets/MJC square.png";

const Home: FC = () => {
    return (
        <div>
            <h1>Home</h1>
            <Image src={logo} className={"w-50"}></Image>
            <p>Club room location: Room 3206B, The Nest</p>
            <p>The University of British Columbia, Vancouver, BC</p>
            <p>
                Instagram: <a href={"https://www.instagram.com/ubcmahjongclub"}>ubcmahjongclub</a>
            </p>
            <p>Email: ubcmahjongclub@gmail.com </p>
            <p>
                <a href={"https://discord.gg/JQaTEF6fQR"}>Join our discord channel</a> for latest
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
