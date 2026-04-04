import { Link } from "@mui/material";
export const Resources = () => {
    return (
        <div className={"my-4"}>
            <h1>Study resources</h1>
            <h2>Riichi Mahjong</h2>
            <p>
                <Link href="https://docs.google.com/document/d/1e-vHoRqpJArIZwo8wttzzWtZRBbppPmtn-FZ-qevVn8">
                    Ruleset
                </Link>
            </p>
            <p>
                <Link href="https://docs.google.com/document/d/1SAMOHtm80w2xml9_VCZi3Mfq1XNrGfAamsZJvmpgi08">
                    Rules and Etiquette
                </Link>
            </p>
            <h3>Tutorials</h3>
            <p>
                <Link href="https://github.com/dainachiba/RiichiBooks/raw/master/RiichiBook1.pdf">
                    Riichi Book 1
                </Link>
            </p>
            <p>
                <Link href="https://drive.google.com/drive/folders/18hxO5DMVAqxSNV9VvpjAg6YjyPVAMzyS">
                    Cheat Sheet
                </Link>
            </p>
            <p>
                {"Beginner's Luck "}
                <Link href="http://beginners.biz/">Japanese</Link>{" "}
                <Link href="https://www.bilibili.com/read/readlist/rl45758">Chinese</Link>
            </p>
            <p>
                {"Uzaku's tile efficiency "}
                <Link href="https://drive.google.com/file/d/1ApHp2Dm-3dkEQTEAnmfTsk8J6OaH8d4G/view">
                    English
                </Link>{" "}
                <Link href="https://www.bilibili.com/read/readlist/rl509592">Chinese</Link>
            </p>
            <p>
                {"WWYD 300 "}
                <Link href="https://files.riichi.moe/mjg/books%20(en)/300%20Established%20Practice%20Which%20to%20cut%20%28wwyd-chan%201%29.pdf">
                    English
                </Link>{" "}
                <Link href="https://www.bilibili.com/read/readlist/rl380536">Chinese</Link>
            </p>
            <p>
                {"WWYD 301 "}
                <Link href="https://drive.google.com/file/d/1HQcoZ96XSVnEzy_ABNOxkxHLYQgYAeWr/view">
                    English
                </Link>{" "}
                <Link href="https://www.bilibili.com/read/readlist/rl493079">Chinese</Link>
            </p>
            <h2>Hong Kong Mahjong</h2>
            <p>
                <Link href="https://docs.google.com/document/d/1ECK29S6p-Lx63P6eMkM2bnQY7mueEout8MvZS13A4Hk">
                    Charter
                </Link>
            </p>
        </div>
    );
};
