import { FC, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import LegacyJapaneseGameTable, { ModifiedJapaneseRound } from "./LegacyJapaneseGameTable";
import {
    isGameEnd,
    JapaneseActions,
    JapaneseLabel,
    JapaneseRoundType,
    JP_LABEL_MAP,
    JP_ROUND_TYPE_BUTTONS,
    JP_UNDEFINED_HAND
} from "../../common/constants";
import ListToggleButton from "../../common/RoundTypeButtonList";
import PlayerButtonRow from "../../common/PlayerButtonRow";
import { japanesePointsWheel } from "../../../common/Utils";
import DropdownInput from "../../common/DropdownInput";
import { LegacyGameProps } from "../../Game";
import {
    addDealIn, addInRoundRyuukyoku, addNagashiMangan, addPaoDealIn, addPaoSelfDraw,
    addSelfDraw,
    createJapaneseRoundRequest,
    generateOverallScoreDelta
} from "../controller/JapaneseRound";
import { validateCreateJapaneseRound } from "../controller/ValidateJapaneseRound";
import alert from "../../../common/AlertDialog";

const LegacyJapaneseGame: FC<LegacyGameProps> = ({
   enableRecording,
   players,
   game,
   handleSubmitRound,
}) => {
    const [roundType, setRoundType] = useState<JapaneseRoundType>(JapaneseRoundType.DEAL_IN);
    const [roundActions, setRoundActions] = useState<JapaneseActions>({});
    const [hand, setHand] = useState<JapaneseHandInput>(JP_UNDEFINED_HAND);
    const [tenpaiList, setTenpaiList] = useState<number[]>([]);
    const [riichiList, setRiichiList] = useState<number[]>([]);
    const [transactions, setTransactions] = useState<JapaneseTransaction[]>([]);
    const gameOver = isGameEnd(game, "jp");

    const roundTypeOnChange = (type: JapaneseRoundType) => {
        const prevWinner = roundActions.WINNER;
        const prevLoser = roundActions.LOSER;
        const prevPao = roundActions.PAO;

        const newRoundActions: JapaneseActions = {};

        switch (type) {
            case JapaneseRoundType.DEAL_IN:
                newRoundActions.WINNER = prevWinner;
                newRoundActions.LOSER = prevLoser;
                break;
            case JapaneseRoundType.DEAL_IN_PAO:
                newRoundActions.WINNER = prevWinner;
                newRoundActions.LOSER = prevLoser;
                newRoundActions.PAO = prevPao;
                break;
            case JapaneseRoundType.SELF_DRAW:
                newRoundActions.WINNER = prevWinner;
                break;
            case JapaneseRoundType.SELF_DRAW_PAO:
                newRoundActions.WINNER = prevWinner;
                newRoundActions.PAO = prevPao;
                break;
            case JapaneseRoundType.DECK_OUT:
                setTenpaiList([]);
                break;
        }
        setRoundActions(newRoundActions);
        setRoundType(type);

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
    }

    const handOnChange = (label: string, value: number) => {
        if (label !== "han" && label !== "fu" && label !== "dora") {
            return;
        }

        const newHand: JapaneseHandInput = { ...hand };
        newHand[label] = +value;
        setHand(newHand);
    }

    const submitRound = async () => {
        try {
            const dealerIndex = game.currentRound?.roundNumber!-1
            switch (roundType) {
                case JapaneseRoundType.DEAL_IN:
                    setTransactions([addDealIn(roundActions.WINNER!, roundActions.LOSER!, dealerIndex, hand)]);
                    break;
                case JapaneseRoundType.SELF_DRAW:
                    setTransactions([addSelfDraw(roundActions.WINNER!, dealerIndex, hand)]);
                    break;
                case JapaneseRoundType.DECK_OUT:
                    break;
                case JapaneseRoundType.RESHUFFLE:
                    setTransactions([addInRoundRyuukyoku()]);
                    break;
                case JapaneseRoundType.DEAL_IN_PAO:
                    setTransactions([addPaoDealIn(roundActions.WINNER!, roundActions.LOSER!, roundActions.PAO!, dealerIndex, hand)]);
                    break;
                case JapaneseRoundType.SELF_DRAW_PAO:
                    setTransactions([addPaoSelfDraw(roundActions.WINNER!, roundActions.PAO!, dealerIndex, hand)]);
                    break;
                case JapaneseRoundType.NAGASHI_MANGAN:
                    setTransactions([addNagashiMangan(roundActions.WINNER!, dealerIndex)])
                    break;
            }
            validateCreateJapaneseRound(tenpaiList, riichiList, transactions);
        } catch (e: any) {
            await alert(e.message);
            setTransactions([]);
            return;
        }
        const roundRequest: JapaneseRound = createJapaneseRoundRequest(game.currentRound!, transactions, tenpaiList, riichiList);

        console.log(roundRequest);
        await handleSubmitRound(roundRequest);
    }

    const getJapaneseLabels = () => {
        let labels: [JapaneseLabel, (number | undefined)[]][] = [];

        switch (roundType) {
            case JapaneseRoundType.DEAL_IN:
            case JapaneseRoundType.DEAL_IN_PAO:
                labels = [
                    [JapaneseLabel.WINNER, [roundActions.WINNER]],
                    [JapaneseLabel.LOSER, [roundActions.LOSER]],
                ];
                break;
            case JapaneseRoundType.SELF_DRAW:
            case JapaneseRoundType.SELF_DRAW_PAO:
                labels = [
                    [JapaneseLabel.WINNER, [roundActions.WINNER]],
                ];
                break;
            case JapaneseRoundType.DECK_OUT:
                labels = [
                    [JapaneseLabel.TENPAI, tenpaiList],
                ];
                break;
            case JapaneseRoundType.NAGASHI_MANGAN:
                labels = [
                    [JapaneseLabel.WINNER, [roundActions.WINNER]],
                    [JapaneseLabel.TENPAI, tenpaiList]
                ]
        }
        return labels;
    }

    const getRecordingInterface = () => {
        return (
            <>
                <Row className="gx-2">
                    {JP_ROUND_TYPE_BUTTONS.map((button, idx) => (
                        <Col key={idx} xs={4}>
                            <ListToggleButton
                                index={idx}
                                name={button.name}
                                value={button.value}
                                checked={roundType === button.value}
                                onChange={(value) => roundTypeOnChange(value as unknown as JapaneseRoundType)}
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
                {getPointsInput()}
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
        return typeof roundActions.WINNER !== "undefined"
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
    }

    return (
        <Container>
            {enableRecording && !gameOver && (
                getRecordingInterface()
            )}
            <LegacyJapaneseGameTable
                rounds={mapRoundsToModifiedRounds(game.rounds as JapaneseRound[])}
                players={players}
            />
        </Container>
    );
};

export default LegacyJapaneseGame;
