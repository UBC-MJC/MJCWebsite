import { FC, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import LegacyJapaneseGameTable from "./LegacyJapaneseGameTable";
import {
    JapaneseActions,
    JapaneseLabel,
    JapaneseRoundType,
    JP_LABEL_MAP,
    JP_ROUND_TYPE_BUTTONS,
    JP_UNDEFINED_HAND, Wind,
} from "../../common/constants";
import ListToggleButton from "../../common/RoundTypeButtonList";
import PlayerButtonRow from "../../common/PlayerButtonRow";
import { japanesePointsWheel } from "../../../common/Utils";
import DropdownInput from "../../common/DropdownInput";
import { LegacyGameProps } from "../../Game";
import {
    addScoreDeltas,
    createJapaneseRoundRequest,
    generateOverallScoreDelta,
    isGameEnd
} from "../controller/JapaneseRound";
import { validateCreateJapaneseRound } from "../controller/ValidateJapaneseRound";
import {getStartingScore} from "../controller/Types";

const LegacyJapaneseGame: FC<LegacyGameProps> = ({
   enableRecording,
   players,
   game,
   handleSubmitRound,
}) => {
    const [roundType, setRoundType] = useState<JapaneseRoundType>(JapaneseRoundType.DEAL_IN);
    const [roundActions, setRoundActions] = useState<JapaneseActions>({});
    const [hasSecondHand, setHasSecondHand] = useState<boolean>(false);
    const [hand, setHand] = useState<JapaneseHandInput>(JP_UNDEFINED_HAND);
    const [secondHand, setSecondHand] = useState<JapaneseHandInput>(JP_UNDEFINED_HAND);
    const [tenpaiList, setTenpaiList] = useState<number[]>([]);
    const [riichiList, setRiichiList] = useState<number[]>([]);

    const gameOver = isGameEnd(game.currentRound!, game.rounds as JapaneseRound[]);

    const roundTypeOnChange = (type: JapaneseRoundType) => {
        const prevWinner = roundActions.WINNER;
        const prevWinner2 = roundActions.WINNER_2;
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

        if (hasSecondHand) {
            newRoundActions.WINNER_2 = prevWinner2;
        }

        setRoundActions(newRoundActions);
        setRoundType(type);
        setSecondHand(JP_UNDEFINED_HAND);

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

    const secondHandOnChange = (label: string, value: any) => {
        if (label !== "han" && label !== "fu" && label !== "dora") {
            return;
        }

        const newSecondHand: JapaneseHandInput = { ...secondHand };
        newSecondHand[label] = value;
        setSecondHand(newSecondHand);
    }

    const submitRound = async () => {
        validateCreateJapaneseRound(roundType, roundActions, tenpaiList, riichiList, hand, hasSecondHand, secondHand);
        const roundRequest = createJapaneseRoundRequest(roundType, roundActions, tenpaiList, riichiList, hand, hasSecondHand, secondHand, game.currentRound!);
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

        }

        if (hasSecondHand) {
            labels.push([JapaneseLabel.WINNER_2, [roundActions.WINNER_2]]);
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
                {showPointInput() && (
                    <Col xs sm={3} className="mx-auto">
                        <Form>
                            <Form.Switch
                                label="Double Deal In"
                                onChange={(e) => setHasSecondHand(e.target.checked)}
                            />
                        </Form>
                    </Col>
                )}
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
                {hasSecondHand && (
                    <Row>
                        <h5>Second Hand:</h5>
                        {japanesePointsWheel.map((wheel, idx) => (
                            <DropdownInput
                                key={wheel.label}
                                label={wheel.label}
                                data={wheel.data}
                                onChange={(value) => secondHandOnChange(wheel.value, value)}
                            />
                        ))}
                    </Row>
                )}
            </>
        );
    };

    return (
        <Container>
            {enableRecording && !gameOver && (
                getRecordingInterface()
            )}
            <LegacyJapaneseGameTable
                rounds={game.rounds as JapaneseRound[]}
                players={players}
            />
        </Container>
    );
};

export default LegacyJapaneseGame;
