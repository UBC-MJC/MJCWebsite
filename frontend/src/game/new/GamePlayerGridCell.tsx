import { Badge } from "@mui/material";
import type { GamePlayer } from "@/types";

interface GamePlayerGridCellProps {
    player: GamePlayer;
}

const GamePlayerGridCell = ({ player }: GamePlayerGridCellProps) => {
    return (
        <div>
            <div>{player.trueWind}</div>
            <div>{player.username}</div>
            {/*<div>{player.score}</div>*/}
            <Badge color="primary">Tenpai</Badge>
        </div>
    );
};

export default GamePlayerGridCell;
