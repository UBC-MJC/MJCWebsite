import { useState } from "react";
import LegacyHongKongGameTable, { ModifiedHongKongRound } from "./LegacyHongKongGameTable";
import type { HongKongRound, HongKongHandInput } from "@/types";
import { getScoresWithPlayers, hongKongPointsWheel } from "@/common/Utils";
import alert from "@/common/AlertDialog";
import {
    assignRoundAction,
    HK_EXCLUSIVE_LABELS,
    HK_PRIMARY_TRANSACTION_TYPES,
    HK_TRANSACTION_TYPE_BUTTONS,
    HK_DEFAULT_HAND,
    HongKongActions,
    HongKongLabel,
    HongKongTransactionType,
    isGameEnd,
} from "@/game/common/constants";
import PlayerButtonRow from "@/game/common/PlayerButtonRow";
import { LegacyGameProps } from "@/game/Game";
import PointsInput from "@/game/common/PointsInput";
import TransactionTypeSelector from "@/game/common/TransactionTypeSelector";
import StepSection from "@/game/common/StepSection";
import RoundRequirements from "@/game/common/RoundRequirements";
import { Footer } from "@/game/common/Footer";
import { createHongKongRoundRequest, generateOverallScoreDelta } from "../controller/HongKongRound";
import {
    getUnmetHongKongRoundRequirements,
    validateHongKongRound,
} from "../controller/ValidateHongKongRound";
import { Box, Button, Stack, Card, CardContent } from "@mui/material";

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
    const [hand, setHand] = useState<HongKongHandInput>(HK_DEFAULT_HAND);
    const gameOver = isGameEnd(game, "hk");
    const unmetRequirements = getUnmetHongKongRoundRequirements(transactionType, roundActions);

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
            setHand(HK_DEFAULT_HAND);
        }
    };

    const actionOnChange = (playerIndex: number, label: HongKongLabel) => {
        setRoundActions(assignRoundAction(roundActions, label, playerIndex, HK_EXCLUSIVE_LABELS));
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
        const playerLabels = getHongKongLabels();
        return (
            <Card>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Stack spacing={3}>
                        <StepSection step={1} title="Result">
                            <TransactionTypeSelector
                                buttons={HK_TRANSACTION_TYPE_BUTTONS}
                                primaryValues={HK_PRIMARY_TRANSACTION_TYPES}
                                value={transactionType}
                                onChange={transactionTypeOnChange}
                            />
                        </StepSection>

                        {playerLabels.length > 0 && (
                            <StepSection step={2} title="Players">
                                <Stack spacing={2}>
                                    {playerLabels.map(([label, labelPlayerIds]) => (
                                        <PlayerButtonRow
                                            key={label}
                                            players={players}
                                            label={label}
                                            labelPlayerIds={labelPlayerIds}
                                            onChange={actionOnChange}
                                        />
                                    ))}
                                </Stack>
                            </StepSection>
                        )}

                        {showPointInput() && (
                            <StepSection step={3} title="Points">
                                <Box sx={{ display: "flex", justifyContent: "center" }}>
                                    <PointsInput
                                        pointsWheel={hongKongPointsWheel}
                                        onChange={handOnChange}
                                        values={{ points: String(hand) }}
                                    />
                                </Box>
                            </StepSection>
                        )}

                        <Stack spacing={1.5} sx={{ width: "100%" }}>
                            <Button
                                color="success"
                                variant="contained"
                                disabled={gameOver || unmetRequirements.length > 0}
                                onClick={submitRound}
                                fullWidth
                                size="large"
                            >
                                Submit Round
                            </Button>
                            <RoundRequirements requirements={unmetRequirements} />
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
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
            <Stack spacing={3}>
                {enableRecording && !gameOver && getRecordingInterface()}

                <Box sx={{ width: "100%" }}>
                    <LegacyHongKongGameTable
                        rounds={mapRoundsToModifiedRounds(game.rounds)}
                        players={players}
                        dealerIndex={
                            game.currentRound ? game.currentRound.roundNumber - 1 : undefined
                        }
                    />
                </Box>
            </Stack>
            <Footer
                scores={getScoresWithPlayers(game, "hk")}
                dealerIndex={game.currentRound ? game.currentRound.roundNumber - 1 : undefined}
            />
        </>
    );
};

export default LegacyHongKongGame;
