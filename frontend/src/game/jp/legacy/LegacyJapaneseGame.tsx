import { useState } from "react";
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
    assignRoundAction,
    isGameEnd,
    JapaneseActions,
    JapaneseLabel,
    JapaneseTransactionType,
    JP_EXCLUSIVE_LABELS,
    JP_PRIMARY_TRANSACTION_TYPES,
    JP_SINGLE_ACTION_BUTTONS,
    JP_TRANSACTION_TYPE_BUTTONS,
    JP_UNDEFINED_HAND,
} from "@/game/common/constants";
import PlayerButtonRow from "@/game/common/PlayerButtonRow";
import PointsInput from "@/game/common/PointsInput";
import TransactionTypeSelector from "@/game/common/TransactionTypeSelector";
import StepSection from "@/game/common/StepSection";
import RoundRequirements from "@/game/common/RoundRequirements";
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
import {
    getUnmetJapaneseRoundRequirements,
    validateJapaneseRound,
    validateTransaction,
} from "../controller/ValidateJapaneseRound";
import {
    Button,
    FormControlLabel,
    Switch,
    Stack,
    Box,
    Card,
    CardContent,
} from "@mui/material";

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

// Riichi declarations raise the conventional default fu from 30 to 40.
const defaultFu = (riichiList: number[]) => (riichiList.length > 0 ? 40 : 30);

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
    const unmetRequirements = getUnmetJapaneseRoundRequirements(
        transactionType,
        roundActions,
        hand,
    );

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
        } else if (type === JapaneseTransactionType.DECK_OUT) {
            // Riichi players are tenpai by definition on a deck out.
            setTenpaiList((prev) => Array.from(new Set([...prev, ...riichiList])));
        }

        setTransactionType(type);
        if (!showPointInput(transactionType)) {
            setHand({ ...JP_UNDEFINED_HAND, fu: defaultFu(riichiList) });
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

        setRoundActions(assignRoundAction(roundActions, label, playerIndex, JP_EXCLUSIVE_LABELS));
    };

    const riichiOnChange = (playerIndex: number) => {
        const isAdding = !riichiList.includes(playerIndex);
        const newRiichiList = isAdding
            ? [...riichiList, playerIndex]
            : riichiList.filter((index: number) => index !== playerIndex);
        setRiichiList(newRiichiList);
        // Fu defaults to 40 once anyone has declared riichi, otherwise 30.
        setHand((prev) => ({ ...prev, fu: defaultFu(newRiichiList) }));

        if (!isAdding) {
            return;
        }

        // On a deck out, a riichi player is tenpai by definition.
        if (transactionType === JapaneseTransactionType.DECK_OUT) {
            setTenpaiList((prev) =>
                prev.includes(playerIndex) ? prev : [...prev, playerIndex],
            );
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
        const labelsRecord = {
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
        } as const;

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
            <Card>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Stack spacing={3}>
                        <StepSection step={1} title="Result">
                            <TransactionTypeSelector
                                buttons={getActions()}
                                primaryValues={JP_PRIMARY_TRANSACTION_TYPES}
                                value={transactionType}
                                onChange={transactionTypeOnChange}
                                extraOptions={
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={multipleHandInputMode}
                                                onChange={(_e, checked) =>
                                                    setMultipleHandInputMode(checked)
                                                }
                                            />
                                        }
                                        label="Multiple Transactions"
                                    />
                                }
                            />
                        </StepSection>

                        <StepSection step={2} title="Players">
                            <Stack spacing={2}>
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
                            </Stack>
                        </StepSection>

                        {showPointInput(transactionType) && (
                            <StepSection step={3} title="Points">
                                <Box sx={{ display: "flex", justifyContent: "center" }}>
                                    <PointsInput
                                        pointsWheel={japanesePointsWheel}
                                        onChange={handOnChange}
                                        values={{
                                            han: String(hand.han),
                                            fu: String(hand.fu),
                                            dora: String(hand.dora),
                                        }}
                                    />
                                </Box>
                            </StepSection>
                        )}

                        {getTransactionMatters()}
                    </Stack>
                </CardContent>
            </Card>
        );
    };
    function getTransactionMatters() {
        if (!multipleHandInputMode) {
            return (
                <Stack spacing={1.5} sx={{ width: "100%" }}>
                    <Button
                        color="success"
                        variant="contained"
                        disabled={gameOver || unmetRequirements.length > 0}
                        onClick={submitSingleTransactionRound}
                        size="large"
                        fullWidth
                    >
                        Submit Round
                    </Button>
                    <RoundRequirements requirements={unmetRequirements} />
                </Stack>
            );
        }
        return (
            <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <Button
                        variant="contained"
                        disabled={gameOver}
                        onClick={addTransaction}
                        fullWidth
                    >
                        Add Transaction
                    </Button>
                    <Button
                        color="warning"
                        variant="contained"
                        disabled={gameOver || transactions.length === 0}
                        onClick={deleteLastTransaction}
                        fullWidth
                    >
                        Delete Last Transaction
                    </Button>
                </Stack>
                {transactions.length > 0 && <Box>{getTransactionListRender(transactions)}</Box>}
                <Button
                    color="success"
                    variant="contained"
                    disabled={gameOver || transactions.length === 0}
                    onClick={submitAllTransactionRound}
                    size="large"
                    fullWidth
                >
                    Submit Round
                </Button>
            </Stack>
        );
    }

    const riichiStickCount = getRiichiStickCount(game.rounds, riichiList);

    return (
        <>
            <Stack spacing={3}>
                {enableRecording && !gameOver && getRecordingInterface()}

                <Box sx={{ width: "100%" }}>
                    <LegacyJapaneseGameTable
                        rounds={mapRoundsToModifiedRounds(game.rounds)}
                        players={players}
                        dealerIndex={
                            game.currentRound ? game.currentRound.roundNumber - 1 : undefined
                        }
                    />
                </Box>
            </Stack>
            <Footer
                scores={getScoresWithPlayers(game, "jp")}
                riichiList={riichiList}
                riichiStickCount={riichiStickCount}
                dealerIndex={game.currentRound ? game.currentRound.roundNumber - 1 : undefined}
            />
        </>
    );
};

export default LegacyJapaneseGame;
