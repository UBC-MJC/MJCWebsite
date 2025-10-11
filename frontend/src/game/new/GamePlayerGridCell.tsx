import { FC, memo } from "react";
import { Badge } from "@mui/material";
import type { GamePlayer } from "@/types";

interface GamePlayerGridCellProps {
    player: GamePlayer;
}

const GamePlayerGridCell: FC<GamePlayerGridCellProps> = ({ player }) => {
    return (
        <div>
            <div>{player.trueWind}</div>
            <div>{player.username}</div>
            {/*<div>{player.score}</div>*/}
            <Badge color="primary">Tenpai</Badge>
        </div>
    );
};

export default memo(GamePlayerGridCell);
