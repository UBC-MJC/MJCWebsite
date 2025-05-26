import React, { FC } from "react";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import riichiStick from "../../assets/riichiStick.png";
import { getRiichiStickCount, getScoresWithPlayers } from "../../common/Utils";

export const Footer: FC<{
    game: Game;
    gameVariant: GameVariant;
    riichiList: number[];
}> = ({ game, gameVariant, riichiList }) => {
    return (
        <Container>
            {gameVariant === "jp" && (
                <Stack direction="row" alignItems="center" mb={2}>
                    <Typography variant="h5">
                        Riichi sticks:{" "}
                        {getRiichiStickCount(game.rounds as JapaneseRound[], riichiList)}
                    </Typography>
                </Stack>
            )}
            <Stack direction="row" spacing={2}>
                {getScoresWithPlayers(game, gameVariant).map(
                    ({ username, score, eloDelta }, idx) => (
                        <Stack direction="column" alignItems="center" key={idx} spacing={1}>
                            <Typography>{username}</Typography>
                            <div>
                                {riichiList.includes(idx) && (
                                    <img src={riichiStick} alt="Riichi Stick" />
                                )}
                            </div>
                            <Typography>
                                {score - Number(riichiList.includes(idx)) * 1000}
                            </Typography>
                            <Typography>{eloDelta.toFixed(1)}</Typography>
                        </Stack>
                    ),
                )}
            </Stack>
        </Container>
    );
};
