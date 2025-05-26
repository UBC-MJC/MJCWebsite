import { FC } from "react";
import Stack from "@mui/material/Stack";
import { getScoresWithPlayers } from "../../common/Utils";

const GameSummaryBody: FC<{ game: Game; gameVariant: GameVariant }> = ({ game, gameVariant }) => {
    return (
        <Stack direction="row" spacing={2} width="100%">
            {getScoresWithPlayers(game, gameVariant)
                .sort((a, b) => b.score - a.score)
                .map((score, idx) => (
                    <Stack key={idx} direction="column" spacing={1} flex={1}>
                        <div>
                            {mapIndextoPlace(idx)} - {score.username}
                        </div>
                        <div>{score.score}</div>
                    </Stack>
                ))}
        </Stack>
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
