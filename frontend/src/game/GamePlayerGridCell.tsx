import {FC} from "react";
import {Badge} from "react-bootstrap";

type GamePlayerGridCellProps = {
    player: any
}

const GamePlayerGridCell: FC<GamePlayerGridCellProps> = ({player}) => {
    return (
        <div>
            <div>{player.trueWind}</div>
            <div>{player.username}</div>
            <div>{player.score}</div>
            <Badge bg="primary">Tenpai</Badge>
        </div>
    )
}

export default GamePlayerGridCell;
