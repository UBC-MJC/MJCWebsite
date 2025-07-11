import React, { FC } from "react";
import riichiStick from "../../assets/riichiStick.png";
import { Box, Stack } from "@mui/material";

export const Footer: FC<{
    scores: { username: string; score: number; eloDelta: number }[];
    riichiList?: number[];
    riichiStickCount?: number;
}> = ({ scores, riichiList, riichiStickCount }) => {
    const getInnerContent = () => {
        if (riichiList) {
            return (
                <>
                    {riichiStickCount !== undefined ? (
                        <h5>Riichi sticks: {riichiStickCount}</h5>
                    ) : null}
                    <Stack direction="row" spacing={2} justifyContent={"center"} alignItems="end">
                        {scores.map(({ username, score, eloDelta }, idx) => (
                            <Box key={idx} width="20%">
                                <div>{username}</div>
                                <div>
                                    {riichiList.includes(idx) && (
                                        <img src={riichiStick} width="50%" />
                                    )}
                                </div>
                                <h2>{score - Number(riichiList.includes(idx)) * 1000}</h2>
                                <div>{eloDelta.toFixed(1)}</div>
                            </Box>
                        ))}
                    </Stack>
                </>
            );
        }
        return (
            <Stack direction="row" spacing={2} justifyContent={"center"}>
                {scores.map(({ username, score, eloDelta }, idx) => (
                    <Box key={idx} width="20%">
                        <div>{username}</div>
                        <h2>{score}</h2>
                        <div>{eloDelta.toFixed(1)}</div>
                    </Box>
                ))}
            </Stack>
        );
    };

    return (
        <Stack
            position="fixed"
            bgcolor="background.paper"
            zIndex={2}
            spacing={1}
            width="100%"
            left={0}
            right={0}
            bottom={0}
            alignItems={"center"}
        >
            <Box width="100%" maxWidth="100%">
                {getInnerContent()}
            </Box>
        </Stack>
    );
};
