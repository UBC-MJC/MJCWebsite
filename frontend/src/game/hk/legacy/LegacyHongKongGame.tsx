import React, { useState } from "react";
import LegacyHongKongGameTable, { ModifiedHongKongRound } from "./LegacyHongKongGameTable";
import type { HongKongRound, HongKongHandInput } from "@/types";
import { getScoresWithPlayers, hongKongPointsWheel } from "@/common/Utils";
import alert from "@/common/AlertDialog";
import {
    HK_TRANSACTION_TYPE_BUTTONS,
    HK_UNDEFINED_HAND,
    HongKongActions,
    HongKongLabel,
    HongKongTransactionType,
    isGameEnd,
} from "@/game/common/constants";
import PlayerButtonRow from "@/game/common/PlayerButtonRow";
import { LegacyGameProps } from "@/game/Game";
import PointsInput from "@/game/common/PointsInput";
import { Footer } from "@/game/common/Footer";
import { createHongKongRoundRequest, generateOverallScoreDelta } from "../controller/HongKongRound";
import { validateHongKongRound } from "../controller/ValidateHongKongRound";
import { Box, Button, ToggleButton, Stack, Paper, ToggleButtonGroup, Divider } from "@mui/material";

const LegacyHongKongGame = ({
    enableRecording,
    players,
    game,
    handleSubmitRound,
}: LegacyGameProps<"hk">) => {
    const [transactionType, setTransactionType] = useState<HongKongTransactionType>(
        HongKongTransactionType.DEAL_IN,
    );
    const [roundActions, setRoundActions] = useState<HongKongActions>({});
    const [hand, setHand] = useState<HongKongHandInput>(HK_UNDEFINED_HAND);
    const gameOver = isGameEnd(game, "hk");

    const transactionTypeOnChange = (type: HongKongTransactionType) => {
        const prevWinner = roundActions.WINNER;
        const prevLoser = roundActions.LOSER;
        const prevPao = roundActions.PAO;

        const newRoundActions: HongKongActions = {};

        switch (type) {
            case HongKongTransactionType.DEAL_IN:
                newRoundActions.WINNER = prevWinner;
                newRoundActions.LOSER = prevLoser;
                break;
            case HongKongTransactionType.DEAL_IN_PAO:
                newRoundActions.WINNER = prevWinner;
                newRoundActions.LOSER = prevLoser;
                newRoundActions.PAO = prevPao;
                break;
            case HongKongTransactionType.SELF_DRAW:
                newRoundActions.WINNER = prevWinner;
                break;
            case HongKongTransactionType.SELF_DRAW_PAO:
                newRoundActions.WINNER = prevWinner;
                newRoundActions.PAO = prevPao;
                break;
            case HongKongTransactionType.DECK_OUT:
                break;
        }

        setRoundActions(newRoundActions);
        setTransactionType(type);
        if (!showPointInput()) {
            setHand(HK_UNDEFINED_HAND);
        }
    };

    const actionOnChange = (playerIndex: number, label: HongKongLabel) => {
        const newRoundActions: HongKongActions = { ...roundActions };
        newRoundActions[label] = playerIndex;
        setRoundActions(newRoundActions);
    };

    const handOnChange = (_: string, value: string) => {
        setHand(+value);
    };

    const submitRound = async () => {
        const roundRequest = createHongKongRoundRequest(
            transactionType,
            roundActions,
            hand,
            game.currentRound!,
        );
        try {
            validateHongKongRound(roundRequest.transactions);
        } catch (e) {
            const error = e as Error;
            await alert(error.message);
            return;
        }

        await handleSubmitRound(roundRequest);
    };

    const getHongKongLabels = (): [HongKongLabel, (number | undefined)[]][] => {
        switch (transactionType) {
            case HongKongTransactionType.DEAL_IN:
                return [
                    [HongKongLabel.WINNER, [roundActions.WINNER]],
                    [HongKongLabel.LOSER, [roundActions.LOSER]],
                ];
            case HongKongTransactionType.DEAL_IN_PAO:
                return [
                    [HongKongLabel.WINNER, [roundActions.WINNER]],
                    [HongKongLabel.LOSER, [roundActions.LOSER]],
                    [HongKongLabel.PAO, [roundActions.PAO]],
                ];
            case HongKongTransactionType.SELF_DRAW:
                return [[HongKongLabel.WINNER, [roundActions.WINNER]]];
            case HongKongTransactionType.SELF_DRAW_PAO:
                return [
                    [HongKongLabel.WINNER, [roundActions.WINNER]],
                    [HongKongLabel.PAO, [roundActions.PAO]],
                ];
            case HongKongTransactionType.DECK_OUT:
                return [];
        }
    };

    const getRecordingInterface = () => {
        return (
            <Paper
                elevation={2}
                sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                    width: "100%",
                    maxWidth: "600px",
                }}
            >
                <Stack spacing={3}>
                    <Box>
                        <ToggleButtonGroup
                            exclusive
                            value={transactionType}
                            onChange={(_event, value) => value && transactionTypeOnChange(value)}
                            sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 1,
                                "& .MuiToggleButton-root": {
                                    flex: "1 1 auto",
                                    minWidth: "120px",
                                    borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
                                    "&:hover": {
                                        borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
                                    },
                                },
                            }}
                        >
                            {HK_TRANSACTION_TYPE_BUTTONS.map((button, idx) => (
                                <ToggleButton key={idx} value={button.value} id={button.name}>
                                    {button.name}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Box>

                    <Divider />

                    {getHongKongLabels().map(([label, labelPlayerIds]) => (
                        <PlayerButtonRow
                            key={label}
                            players={players}
                            label={label}
                            labelPlayerIds={labelPlayerIds}
                            onChange={actionOnChange}
                        />
                    ))}

                    {showPointInput() && (
                        <Box sx={{ my: 2 }}>
                            <PointsInput
                                pointsWheel={hongKongPointsWheel}
                                onChange={handOnChange}
                            />
                        </Box>
                    )}

                    <Button
                        color="success"
                        variant="contained"
                        disabled={gameOver}
                        onClick={submitRound}
                        fullWidth
                        size="large"
                        sx={{ mt: 2 }}
                    >
                        Submit Round
                    </Button>
                </Stack>
            </Paper>
        );
    };

    const showPointInput = () => {
        return typeof roundActions.WINNER !== "undefined";
    };

    const mapRoundsToModifiedRounds = (rounds: HongKongRound[]): ModifiedHongKongRound[] => {
        return rounds.map((round) => {
            return {
                ...round,
                scoreDeltas: generateOverallScoreDelta(round),
            };
        });
    };

    return (
        <>
            <Stack alignItems="center" spacing={3} sx={{ pb: 2 }}>
                {enableRecording && !gameOver && getRecordingInterface()}

                <Box sx={{ width: "100%" }}>
                    <LegacyHongKongGameTable
                        rounds={mapRoundsToModifiedRounds(game.rounds)}
                        players={players}
                    />
                </Box>
            </Stack>
            <Footer scores={getScoresWithPlayers(game, "hk")} />
        </>
    );
};

export default LegacyHongKongGame;
