import React, { FC, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import LegacyHongKongGameTable, { ModifiedHongKongRound } from "./LegacyHongKongGameTable";
import {
    HK_LABEL_MAP,
    HK_TRANSACTION_TYPE_BUTTONS,
    HK_UNDEFINED_HAND,
    HongKongActions,
    HongKongLabel,
    HongKongTransactionType,
    isGameEnd,
} from "../../common/constants";
import ListToggleButton from "../../common/TransactionTypeButtonList";
import PlayerButtonRow from "../../common/PlayerButtonRow";
import { hongKongPointsWheel, japanesePointsWheel } from "../../../common/Utils";
import DropdownInput from "../../common/DropdownInput";
import { LegacyGameProps } from "../../Game";
import { createHongKongRoundRequest, generateOverallScoreDelta } from "../controller/HongKongRound";
import { validateHongKongRound } from "../controller/ValidateHongKongRound";
import alert from "../../../common/AlertDialog";
import PointsInput from "../../common/PointsInput";

const LegacyHongKongGame: FC<LegacyGameProps> = ({
    enableRecording,
    players,
    game,
    handleSubmitRound,
}) => {
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

    const handOnChange = (_: string, value: number) => {
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
        } catch (e: any) {
            await alert(e.message);
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
            <>
                <Row className="gx-2">
                    {HK_TRANSACTION_TYPE_BUTTONS.map((button, idx) => (
                        <Col key={idx} xs={4}>
                            <ListToggleButton
                                index={idx}
                                name={button.name}
                                value={button.value}
                                checked={transactionType.toString() === button.value}
                                onChange={(value) =>
                                    transactionTypeOnChange(
                                        value as unknown as HongKongTransactionType,
                                    )
                                }
                            />
                        </Col>
                    ))}
                </Row>
                {getHongKongLabels().map(([label, labelPlayerIds], idx) => (
                    <Row key={label} className="my-4">
                        <Col>
                            <h5>{HK_LABEL_MAP[label]}:</h5>
                            <PlayerButtonRow
                                players={players}
                                label={label}
                                labelPlayerIds={labelPlayerIds}
                                onChange={actionOnChange}
                            />
                        </Col>
                    </Row>
                ))}
                {showPointInput() && (
                    <PointsInput
                        pointsWheel={hongKongPointsWheel}
                        onChange={handOnChange}
                    ></PointsInput>
                )}
                <Button
                    variant="primary"
                    className="mt-4 w-50"
                    disabled={gameOver}
                    onClick={submitRound}
                >
                    Submit Round
                </Button>
            </>
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
        <Container>
            {enableRecording && !gameOver && getRecordingInterface()}
            <LegacyHongKongGameTable
                rounds={mapRoundsToModifiedRounds(game.rounds as HongKongRound[])}
                players={players}
            />
        </Container>
    );
};

export default LegacyHongKongGame;
