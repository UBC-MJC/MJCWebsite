import { FC } from "react";
import { getScoresWithPlayers } from "../../common/Utils";
import { Grid } from "@mui/material";

const GameSummaryBody: FC<{ game: Game; gameVariant: GameVariant }> = ({ game, gameVariant }) => {
    return (
        <Grid container>
            {getScoresWithPlayers(game, gameVariant)
                .sort((a, b) => b.score - a.score)
                .map((score, idx) => (
                    <Grid size={6} flex={1} minWidth="50%">
                        <div>
                            {mapIndextoPlace(idx)} - {score.username}
                        </div>
                        <div>{score.score}</div>
                    </Grid>
                ))}
        </Grid>
    );
};

const mapIndextoPlace = (idx: number) => {
    switch (idx) {
        case 0:
            return "1st";
        case 1:
            return "2nd";
        case 2:
            return "3rd";
        default:
            return `${idx + 1}th`;
    }
};

export default GameSummaryBody;
