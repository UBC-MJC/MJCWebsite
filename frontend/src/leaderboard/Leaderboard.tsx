import {FC} from "react";

const Leaderboard: FC<GameTypeProp> = ({gameVariant}) => {
    return (
        <div>
            <h1>Leaderboard</h1>
            <h3>{gameVariant}</h3>
        </div>
    )
}

export default Leaderboard
