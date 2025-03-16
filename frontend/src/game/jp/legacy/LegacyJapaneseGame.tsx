import React, { FC, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import LegacyJapaneseGameTable, { ModifiedJapaneseRound } from "./LegacyJapaneseGameTable";
import {
    isGameEnd,
    JapaneseActions,
    JapaneseLabel,
    JapaneseTransactionType,
    JP_SINGLE_ACTION_BUTTONS,
    JP_TRANSACTION_TYPE_BUTTONS,
    JP_UNDEFINED_HAND,
} from "../../common/constants";
import PlayerButtonRow from "../../common/PlayerButtonRow";
import { japanesePointsWheel } from "../../../common/Utils";
import { LegacyGameProps } from "../../Game";
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
import alert from "../../../common/AlertDialog";
import PointsInput from "../../common/PointsInput";
import { Button, ToggleButton, FormControlLabel, Switch } from "@mui/material";
import { Footer } from "../../common/Footer";

function getTransaction(
    game: Game,
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

const LegacyJapaneseGame: FC<LegacyGameProps> = ({
    enableRecording,
    players,
    game,
    handleSubmitRound,
}) => {
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

    const handOnChange = (label: string, value: number) => {
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
        } catch (e: any) {
            await alert(e.message);
        }
    };

    const addTransaction = async () => {
        try {
            const transactionList = getTransactionList();
            setTransactions([...transactions, ...transactionList]);
        } catch (e: any) {
            await alert(e.message);
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
        } catch (e: any) {
            await alert(e.message);
            return;
        }
    };

    const getJapaneseLabels = () => {
        let labels: [JapaneseLabel, (number | undefined)[]][] = [];

        switch (transactionType) {
            case JapaneseTransactionType.DEAL_IN:
                labels = [
                    [JapaneseLabel.WINNER, [roundActions.WINNER]],
                    [JapaneseLabel.LOSER, [roundActions.LOSER]],
                ];
                break;
            case JapaneseTransactionType.DEAL_IN_PAO:
                labels = [
                    [JapaneseLabel.WINNER, [roundActions.WINNER]],
                    [JapaneseLabel.LOSER, [roundActions.LOSER]],
                    [JapaneseLabel.PAO, [roundActions.PAO]],
                ];
                break;
            case JapaneseTransactionType.SELF_DRAW:
                labels = [[JapaneseLabel.WINNER, [roundActions.WINNER]]];
                break;
            case JapaneseTransactionType.SELF_DRAW_PAO:
                labels = [
                    [JapaneseLabel.WINNER, [roundActions.WINNER]],
                    [JapaneseLabel.PAO, [roundActions.PAO]],
                ];
                break;
            case JapaneseTransactionType.DECK_OUT:
                labels = [[JapaneseLabel.TENPAI, tenpaiList]];
                break;
            case JapaneseTransactionType.NAGASHI_MANGAN:
                labels = [
                    [JapaneseLabel.WINNER, [roundActions.WINNER]],
                    [JapaneseLabel.TENPAI, tenpaiList],
                ];
        }
        return labels;
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
                <Col xs sm={3} className="mx-auto">
                    <FormControlLabel
                        control={
                            <Switch onChange={(e, checked) => setMultipleHandInputMode(checked)} />
                        }
                        label="Multiple Transactions"
                    />
                </Col>
                <Row className="gx-2">
                    {getActions().map((button, idx) => (
                        <Col key={idx} xs={4}>
                            <ToggleButton
                                key={idx}
                                className="my-1 w-100"
                                value={button.value}
                                id={button.name}
                                selected={transactionType === button.value}
                                onChange={(event, value) => transactionTypeOnChange(value)}
                            >
                                {button.name}
                            </ToggleButton>
                        </Col>
                    ))}
                </Row>
                <Row className="my-4">
                    <Col>
                        <PlayerButtonRow
                            players={players}
                            label={"RIICHI"}
                            labelPlayerIds={riichiList}
                            onChange={riichiOnChange}
                        />
                    </Col>
                </Row>
                {getJapaneseLabels().map(([label, labelPlayerIds]) => (
                    <Row key={label} className="my-4">
                        <Col>
                            <PlayerButtonRow
                                players={players}
                                label={label as JapaneseLabel}
                                labelPlayerIds={labelPlayerIds}
                                onChange={actionOnChange}
                            />
                        </Col>
                    </Row>
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
                    className="my-4 w-50"
                    disabled={gameOver}
                    onClick={submitSingleTransactionRound}
                >
                    Submit Round
                </Button>
            );
        }
        return (
            <>
                <Row className={"gx-1"}>
                    <Col>
                        <Button
                            variant="contained"
                            className="my-4 w-100"
                            disabled={gameOver}
                            onClick={addTransaction}
                        >
                            Add Transaction
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            color="warning"
                            variant="contained"
                            className="my-4 w-100"
                            disabled={gameOver || transactions.length === 0}
                            onClick={deleteLastTransaction}
                        >
                            Delete Last Transaction
                        </Button>
                    </Col>
                </Row>

                {getTransactionListRender(transactions)}

                <Button
                    color="success"
                    variant="contained"
                    className="my-4 w-50"
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
            <Container>
                {enableRecording && !gameOver && getRecordingInterface()}
                <LegacyJapaneseGameTable
                    rounds={mapRoundsToModifiedRounds(game.rounds as JapaneseRound[])}
                    players={players}
                />
            </Container>
            <Footer game={game} gameVariant={"jp"} riichiList={riichiList} />
        </>
    );
};

export default LegacyJapaneseGame;
