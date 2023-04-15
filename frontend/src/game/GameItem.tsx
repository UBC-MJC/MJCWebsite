import {FC} from "react"

const GameItem: FC<GameProps> = ({game}) => {
    return (
        <div className="Card">
            <div className="Card--text">
                <h1>{game.game_id}</h1>
                <span>{game.created_at}</span>
            </div>
        </div>
    )
}

export default GameItem
