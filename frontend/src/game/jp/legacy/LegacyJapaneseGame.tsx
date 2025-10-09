import React, { useState } from "react";
import LegacyJapaneseGameTable, { ModifiedJapaneseRound } from "./LegacyJapaneseGameTable";
import type {
    JapaneseRound,
    JapaneseHandInput,
    JapaneseTransaction,
    Transaction,
    Game,
} from "@/types";
import { getRiichiStickCount, getScoresWithPlayers, japanesePointsWheel } from "@/common/Utils";
import alert from "@/common/AlertDialog";
import {
    isGameEnd,
    JapaneseActions,
    JapaneseLabel,
    JapaneseTransactionType,
    JP_SINGLE_ACTION_BUTTONS,
    JP_TRANSACTION_TYPE_BUTTONS,
    JP_UNDEFINED_HAND,
} from "@/game/common/constants";
import PlayerButtonRow from "@/game/common/PlayerButtonRow";
import PointsInput from "@/game/common/PointsInput";
import { Footer } from "@/game/common/Footer";
import { LegacyGameProps } from "@/game/Game";
import {
    addDealIn,
    addInRoundRyuukyoku,
    addNagashiMangan,
    addPaoDealIn,
    addPaoSelfDraw,
    addSelfDraw,
    createJapaneseRoundRequest,
    generateOverallScoreDelta,
} from "../controller/JapaneseRound";
import { validateJapaneseRound, validateTransaction } from "../controller/ValidateJapaneseRound";
import { Button, ToggleButton, FormControlLabel, Switch, Stack, Grid, Box } from "@mui/material";

function getTransaction(
    game: Game<"jp">,
    transactionType: JapaneseTransactionType,
    roundActions: JapaneseActions,
    hand: JapaneseHandInput,
) {
    const dealerIndex = game.currentRound.roundNumber - 1;
    switch (transactionType) {
        case JapaneseTransactionType.DEAL_IN:
            return addDealIn(roundActions.WINNER!, roundActions.LOSER!, dealerIndex, hand);
        case JapaneseTransactionType.SELF_DRAW:
            return addSelfDraw(roundActions.WINNER!, dealerIndex, hand);
        case JapaneseTransactionType.INROUND_RYUUKYOKU:
            return addInRoundRyuukyoku();
        case JapaneseTransactionType.DEAL_IN_PAO:
            return addPaoDealIn(
                roundActions.WINNER!,
                roundActions.LOSER!,
                roundActions.PAO!,
                dealerIndex,
                hand,
            );
        case JapaneseTransactionType.SELF_DRAW_PAO:
            return addPaoSelfDraw(roundActions.WINNER!, roundActions.PAO!, dealerIndex, hand);
        case JapaneseTransactionType.NAGASHI_MANGAN:
            return addNagashiMangan(roundActions.WINNER!, dealerIndex);
        default:
            return null;
    }
}

function getTransactionListRender(transactions: Transaction[]) {
    return (
        <ul>
            {transactions.map((transaction, idx) => (
                <li key={idx}>
                    Transaction {idx}: {transaction.scoreDeltas.toString()}
                </li>
            ))}
        </ul>
    );
}

const showPointInput = (transactionType: JapaneseTransactionType) => {
    return ![
        JapaneseTransactionType.NAGASHI_MANGAN,
        JapaneseTransactionType.INROUND_RYUUKYOKU,
        JapaneseTransactionType.DECK_OUT,
    ].includes(transactionType);
};

const mapRoundsToModifiedRounds = (rounds: JapaneseRound[]): ModifiedJapaneseRound[] => {
    return rounds.map((round) => {
        return {
            ...round,
            scoreDeltas: generateOverallScoreDelta(round),
        };
    });
};

const LegacyJapaneseGame = ({
    enableRecording,
    players,
    game,
    handleSubmitRound,
}: LegacyGameProps<"jp">) => {
    const [transactionType, setTransactionType] = useState<JapaneseTransactionType>(
        JapaneseTransactionType.DEAL_IN,
    );
    const [roundActions, setRoundActions] = useState<JapaneseActions>({});
    const [hand, setHand] = useState<JapaneseHandInput>(JP_UNDEFINED_HAND);
    const [tenpaiList, setTenpaiList] = useState<number[]>([]);
    const [riichiList, setRiichiList] = useState<number[]>([]);
    const [transactions, setTransactions] = useState<JapaneseTransaction[]>([]);
    const [multipleHandInputMode, setMultipleHandInputMode] = useState<boolean>(false);

    const gameOver = isGameEnd(game, "jp");

    const transactionTypeOnChange = (type: JapaneseTransactionType) => {
        const prevWinner = roundActions.WINNER;
        const prevLoser = roundActions.LOSER;
        const prevPao = roundActions.PAO;

        const newRoundActions: JapaneseActions = {};

        switch (type) {
            case JapaneseTransactionType.DEAL_IN:
                newRoundActions.WINNER = prevWinner;
                newRoundActions.LOSER = prevLoser;
                break;
            case JapaneseTransactionType.DEAL_IN_PAO:
                newRoundActions.WINNER = prevWinner;
                newRoundActions.LOSER = prevLoser;
                newRoundActions.PAO = prevPao;
                break;
            case JapaneseTransactionType.SELF_DRAW:
                newRoundActions.WINNER = prevWinner;
                break;
            case JapaneseTransactionType.SELF_DRAW_PAO:
                newRoundActions.WINNER = prevWinner;
                newRoundActions.PAO = prevPao;
                break;
            case JapaneseTransactionType.NAGASHI_MANGAN:
                newRoundActions.WINNER = prevWinner;
                break;
        }
        setRoundActions(newRoundActions);

        if (
            type !== JapaneseTransactionType.DECK_OUT &&
            type !== JapaneseTransactionType.NAGASHI_MANGAN
        ) {
            setTenpaiList([]);
        }

        setTransactionType(type);
        if (!showPointInput(transactionType)) {
            setHand(JP_UNDEFINED_HAND);
        }
    };

    const actionOnChange = (playerIndex: number, label: JapaneseLabel) => {
        if (label === JapaneseLabel.TENPAI) {
            if (tenpaiList.includes(playerIndex)) {
                setTenpaiList(tenpaiList.filter((index: number) => index !== playerIndex));
            } else {
                setTenpaiList([...tenpaiList, playerIndex]);
            }
            return;
        }

        const newRoundActions: JapaneseActions = { ...roundActions };
        newRoundActions[label] = playerIndex;
        setRoundActions(newRoundActions);
    };

    const riichiOnChange = (playerIndex: number) => {
        if (riichiList.includes(playerIndex)) {
            setRiichiList(riichiList.filter((index: number) => index !== playerIndex));
        } else {
            setRiichiList([...riichiList, playerIndex]);
        }
    };

    const handOnChange = (label: string, value: string) => {
        if (label !== "han" && label !== "fu" && label !== "dora") {
            return;
        }
        const newHand: JapaneseHandInput = { ...hand };
        newHand[label] = +value;
        setHand(newHand);
    };

    function getTransactionList(): JapaneseTransaction[] {
        const transaction = getTransaction(game, transactionType, roundActions, hand);
        if (transaction !== null) {
            validateTransaction(transaction);
            return [transaction];
        }
        return [];
    }

    const submitSingleTransactionRound = async () => {
        try {
            const transactionList = getTransactionList();
            await submitRound(transactionList);
        } catch (e) {
            const error = e as Error;
            await alert(error.message);
        }
    };

    const addTransaction = async () => {
        try {
            const transactionList = getTransactionList();
            setTransactions([...transactions, ...transactionList]);
        } catch (e) {
            const error = e as Error;
            await alert(error.message);
        }
    };

    const deleteLastTransaction = () => {
        setTransactions(transactions.slice(0, -1));
    };

    const submitRound = async (transactionList: JapaneseTransaction[]) => {
        validateJapaneseRound(tenpaiList, riichiList, transactionList);
        const roundRequest: JapaneseRound = createJapaneseRoundRequest(
            game.currentRound,
            transactionList,
            tenpaiList,
            riichiList,
        );
        await handleSubmitRound(roundRequest);
        setRiichiList([]);
        setTenpaiList([]);
        setTransactions([]);
        setRoundActions({});
    };

    const submitAllTransactionRound = async () => {
        try {
            await submitRound(transactions);
        } catch (e) {
            const error = e as Error;
            await alert(error.message);
            return;
        }
    };

    const getJapaneseLabels = () => {
        const labelsRecord: Record<
            JapaneseTransactionType,
            [JapaneseLabel, (number | undefined)[]][]
        > = {
            [JapaneseTransactionType.DEAL_IN]: [
                [JapaneseLabel.WINNER, [roundActions.WINNER]],
                [JapaneseLabel.LOSER, [roundActions.LOSER]],
            ],
            [JapaneseTransactionType.DEAL_IN_PAO]: [
                [JapaneseLabel.WINNER, [roundActions.WINNER]],
                [JapaneseLabel.LOSER, [roundActions.LOSER]],
                [JapaneseLabel.PAO, [roundActions.PAO]],
            ],
            [JapaneseTransactionType.SELF_DRAW]: [[JapaneseLabel.WINNER, [roundActions.WINNER]]],
            [JapaneseTransactionType.SELF_DRAW_PAO]: [
                [JapaneseLabel.WINNER, [roundActions.WINNER]],
                [JapaneseLabel.PAO, [roundActions.PAO]],
            ],
            [JapaneseTransactionType.DECK_OUT]: [[JapaneseLabel.TENPAI, tenpaiList]],
            [JapaneseTransactionType.NAGASHI_MANGAN]: [
                [JapaneseLabel.WINNER, [roundActions.WINNER]],
                [JapaneseLabel.TENPAI, tenpaiList],
            ],
            [JapaneseTransactionType.INROUND_RYUUKYOKU]: [[JapaneseLabel.TENPAI, tenpaiList]],
        };

        return labelsRecord[transactionType];
    };

    function getActions() {
        if (!multipleHandInputMode) {
            return JP_SINGLE_ACTION_BUTTONS;
        }
        return JP_TRANSACTION_TYPE_BUTTONS;
    }

    const getRecordingInterface = () => {
        return (
            <>
                <FormControlLabel
                    control={
                        <Switch onChange={(_e, checked) => setMultipleHandInputMode(checked)} />
                    }
                    label="Multiple Transactions"
                />
                <Grid container spacing={1}>
                    {getActions().map((button, idx) => (
                        <Grid key={idx}>
                            <ToggleButton
                                key={idx}
                                value={button.value}
                                id={button.name}
                                selected={transactionType === button.value}
                                onChange={(_event, value) => transactionTypeOnChange(value)}
                            >
                                {button.name}
                            </ToggleButton>
                        </Grid>
                    ))}
                </Grid>
                <PlayerButtonRow
                    players={players}
                    label={"RIICHI"}
                    labelPlayerIds={riichiList}
                    onChange={riichiOnChange}
                />
                {getJapaneseLabels().map(([label, labelPlayerIds]) => (
                    <PlayerButtonRow
                        key={label}
                        players={players}
                        label={label}
                        labelPlayerIds={labelPlayerIds}
                        onChange={actionOnChange}
                    />
                ))}
                {showPointInput(transactionType) && (
                    <PointsInput pointsWheel={japanesePointsWheel} onChange={handOnChange} />
                )}

                {getTransactionMatters()}
            </>
        );
    };
    function getTransactionMatters() {
        if (!multipleHandInputMode) {
            return (
                <Button
                    color="success"
                    variant="contained"
                    disabled={gameOver}
                    onClick={submitSingleTransactionRound}
                >
                    Submit Round
                </Button>
            );
        }
        return (
            <>
                <Stack direction="row" spacing={1}>
                    <Button variant="contained" disabled={gameOver} onClick={addTransaction}>
                        Add Transaction
                    </Button>
                    <Button
                        color="warning"
                        variant="contained"
                        disabled={gameOver || transactions.length === 0}
                        onClick={deleteLastTransaction}
                    >
                        Delete Last Transaction
                    </Button>
                </Stack>
                {getTransactionListRender(transactions)}
                <Button
                    color="success"
                    variant="contained"
                    disabled={gameOver || transactions.length === 0}
                    onClick={submitAllTransactionRound}
                >
                    Submit Round
                </Button>
            </>
        );
    }

    return (
        <>
            <Stack alignItems="center" spacing={2}>
                {enableRecording && !gameOver && getRecordingInterface()}
                <LegacyJapaneseGameTable
                    rounds={mapRoundsToModifiedRounds(game.rounds)}
                    players={players}
                />
                <Box paddingBottom={2} />
            </Stack>
            <Footer
                scores={getScoresWithPlayers(game, "jp")}
                riichiList={riichiList}
                riichiStickCount={getRiichiStickCount(game.rounds, riichiList)}
            />
        </>
    );
};

export default LegacyJapaneseGame;
