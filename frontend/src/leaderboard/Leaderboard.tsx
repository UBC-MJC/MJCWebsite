import {FC} from "react";

const Leaderboard: FC<GameTypeProp> = ({gameType}) => {
    return (
        <div>
            <h1>Leaderboard</h1>
            <h3>{gameType}</h3>
        </div>
    )
}

export default Leaderboard
