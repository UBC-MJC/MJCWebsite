import React, { FC, useState } from "react";
import { Button, Col, Container, Form, Row, Image } from "react-bootstrap";
import LegacyJapaneseGameTable, { ModifiedJapaneseRound } from "./LegacyJapaneseGameTable";
import {
    isGameEnd,
    JapaneseActions,
    JapaneseLabel,
    JapaneseTransactionType,
    JP_LABEL_MAP,
    JP_SINGLE_ACTION_BUTTONS,
    JP_TRANSACTION_TYPE_BUTTONS,
    JP_UNDEFINED_HAND,
} from "../../common/constants";
import ListToggleButton from "../../common/TransactionTypeButtonList";
import PlayerButtonRow from "../../common/PlayerButtonRow";
import { japanesePointsWheel } from "../../../common/Utils";
import DropdownInput from "../../common/DropdownInput";
import { LegacyGameProps } from "../../Game";
import {
    addDealIn,
    addInRoundRyuukyoku,
    addNagashiMangan,
    addPaoDealIn,
    addPaoSelfDraw,
    addSelfDraw,
    createJapaneseRoundRequest,
    generateCurrentScore,
    generateOverallScoreDelta,
} from "../controller/JapaneseRound";
import {
    validateCreateTransaction,
    validateCreateJapaneseRound,
} from "../controller/ValidateJapaneseRound";
import alert from "../../../common/AlertDialog";
import riichiStick from "../../../assets/riichiStick.png";

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
        setTransactionType(type);
        if (!showPointInput()) {
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
        const dealerIndex = game.currentRound!.roundNumber! - 1;
        switch (transactionType) {
            case JapaneseTransactionType.DEAL_IN:
                return [addDealIn(roundActions.WINNER!, roundActions.LOSER!, dealerIndex, hand)];
            case JapaneseTransactionType.SELF_DRAW:
                return [addSelfDraw(roundActions.WINNER!, dealerIndex, hand)];
            case JapaneseTransactionType.INROUND_RYUUKYOKU:
                return [addInRoundRyuukyoku()];
            case JapaneseTransactionType.DEAL_IN_PAO:
                return [
                    addPaoDealIn(
                        roundActions.WINNER!,
                        roundActions.LOSER!,
                        roundActions.PAO!,
                        dealerIndex,
                        hand,
                    ),
                ];
            case JapaneseTransactionType.SELF_DRAW_PAO:
                return [addPaoSelfDraw(roundActions.WINNER!, roundActions.PAO!, dealerIndex, hand)];
            case JapaneseTransactionType.NAGASHI_MANGAN:
                return [addNagashiMangan(roundActions.WINNER!, dealerIndex)];
            default:
                return [];
        }
    }

    const submitSingleTransactionRound = async () => {
        const transactionList = getTransactionList();
        await submitRound(transactionList);
    };

    const addTransaction = async () => {
        try {
            validateCreateTransaction(getTransactionList()[0]);
        } catch (e: any) {
            await alert(e.message);
            return;
        }
        setTransactions([...transactions, ...getTransactionList()]);
    };

    const deleteLastTransaction = () => {
        setTransactions(transactions.slice(0, -1));
    };

    const submitRound = async (transactionList: JapaneseTransaction[]) => {
        try {
            validateCreateJapaneseRound(tenpaiList, riichiList, transactionList);
        } catch (e: any) {
            await alert(e.message);
            return;
        }
        const roundRequest: JapaneseRound = createJapaneseRoundRequest(
            game.currentRound!,
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
        await submitRound(transactions);
    };

    const showPointInput = () => {
        return ![
            JapaneseTransactionType.NAGASHI_MANGAN,
            JapaneseTransactionType.INROUND_RYUUKYOKU,
            JapaneseTransactionType.DECK_OUT,
        ].includes(transactionType);
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
                    <Form>
                        <Form.Switch
                            label="Multiple Transactions"
                            onChange={(e) => setMultipleHandInputMode(e.target.checked)}
                        />
                    </Form>
                </Col>
                <Row className="gx-2">
                    {getActions().map((button, idx) => (
                        <Col key={idx} xs={4}>
                            <ListToggleButton
                                index={idx}
                                name={button.name}
                                value={button.value}
                                checked={transactionType === button.value}
                                onChange={(value) =>
                                    transactionTypeOnChange(
                                        value as unknown as JapaneseTransactionType,
                                    )
                                }
                            />
                        </Col>
                    ))}
                </Row>

                {getJapaneseLabels().map(([label, labelPlayerIds], idx) => (
                    <Row key={label} className="my-4">
                        <Col>
                            <h5>{JP_LABEL_MAP[label as JapaneseLabel]}:</h5>
                            <PlayerButtonRow
                                players={players}
                                label={label as JapaneseLabel}
                                labelPlayerIds={labelPlayerIds}
                                onChange={actionOnChange}
                            />
                        </Col>
                    </Row>
                ))}
                {getPointsInput()}
                <Row className="my-4">
                    <Col>
                        <h5>Riichis:</h5>
                        <PlayerButtonRow
                            players={players}
                            label={"RIICHI"}
                            labelPlayerIds={riichiList}
                            onChange={riichiOnChange}
                        />
                    </Col>
                </Row>
                {getTransactionMatters()}
            </>
        );
    };
    function getTransactionMatters() {
        if (!multipleHandInputMode) {
            return (
                <Button
                    variant="success"
                    className="mt-4 w-50"
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
                            variant="primary"
                            className="mt-4 w-100"
                            disabled={gameOver}
                            onClick={addTransaction}
                        >
                            Add Transaction
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            variant="danger"
                            className="mt-4 w-100"
                            disabled={gameOver || transactions.length === 0}
                            onClick={deleteLastTransaction}
                        >
                            Delete Last Transaction
                        </Button>
                    </Col>
                </Row>

                {getTransactionListRender()}

                <Button
                    variant="success"
                    className="mt-4 w-50"
                    disabled={gameOver || transactions.length === 0}
                    onClick={submitAllTransactionRound}
                >
                    Submit Round
                </Button>
            </>
        );
    }

    function getTransactionListRender() {
        const listItems = transactions.map((transaction, idx) => (
            <li key={idx}>
                Transaction {idx}: {transaction.scoreDeltas.toString()}
            </li>
        ));
        return <ul>{listItems}</ul>;
    }

    const getPointsInput = () => {
        if (!showPointInput()) {
            return <></>;
        }

        return (
            <>
                <Row>
                    <h5>Hand:</h5>
                    {japanesePointsWheel.map((wheel, idx) => (
                        <DropdownInput
                            key={wheel.label}
                            label={wheel.label}
                            data={wheel.data}
                            onChange={(value) => handOnChange(wheel.value, value)}
                        />
                    ))}
                </Row>
            </>
        );
    };

    const mapRoundsToModifiedRounds = (rounds: JapaneseRound[]): ModifiedJapaneseRound[] => {
        return rounds.map((round) => {
            return {
                ...round,
                scoreDeltas: generateOverallScoreDelta(round),
            };
        });
    };

    function getFooter() {
        return (
            <Row className={"my-4 position-sticky bottom-0 bg-light row-cols-4 align-items-end"}>
                {generateCurrentScore(game.rounds as JapaneseRound[]).map((score, idx) => (
                    <Col key={idx} className={"my-2"}>
                        <div>{players[idx].username}</div>
                        <div>
                            {riichiList.includes(idx) && (
                                <Image src={riichiStick} className={"w-75"}></Image>
                            )}
                        </div>
                        <h2>{score - Number(riichiList.includes(idx)) * 1000}</h2>
                    </Col>
                ))}
            </Row>
        );
    }

    return (
        <Container>
            {enableRecording && !gameOver && getRecordingInterface()}
            <LegacyJapaneseGameTable
                rounds={mapRoundsToModifiedRounds(game.rounds as JapaneseRound[])}
                players={players}
            />
            {getFooter()}
        </Container>
    );
};

export default LegacyJapaneseGame;
