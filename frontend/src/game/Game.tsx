import {FC} from "react";
import {useParams} from "react-router-dom";

const Game: FC = () => {
    const { id } = useParams()

    return (
        <div>
            <h1>ID: {id}</h1>
        </div>
    )
}

export default Game
