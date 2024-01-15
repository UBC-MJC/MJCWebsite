import { FC, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import LegacyHongKongGameTable from "./LegacyHongKongGameTable";
import {
    HK_LABEL_MAP,
    HK_ROUND_TYPE_BUTTONS,
    HK_UNDEFINED_HAND,
    HongKongActions,
    HongKongLabel,
    HongKongRoundType
} from "../../common/constants";
import ListToggleButton from "../../common/RoundTypeButtonList";
import PlayerButtonRow from "../../common/PlayerButtonRow";
import { hongKongPointsWheel } from "../../../common/Utils";
import DropdownInput from "../../common/DropdownInput";
import { LegacyGameProps } from "../../Game";
import { createHongKongRoundRequest } from "../controller/HongKongRound";
import { validateCreateHongKongRound } from "../controller/ValidateHongKongRound";

const LegacyHongKongGame: FC<LegacyGameProps> = ({
    enableRecording,
    players,
    game,
    handleSubmitRound,
}) => {
    const [roundType, setRoundType] = useState<HongKongRoundType>(HongKongRoundType.DEAL_IN);
    const [roundActions, setRoundActions] = useState<HongKongActions>({});
    const [hasSecondHand, setHasSecondHand] = useState<boolean>(false);
    const [hand, setHand] = useState<HongKongHandInput>(HK_UNDEFINED_HAND);
    const [secondHand, setSecondHand] = useState<HongKongHandInput>(HK_UNDEFINED_HAND);

    const gameOver = typeof game.currentRound === "undefined";

    const roundTypeOnChange = (type: HongKongRoundType) => {
        const prevWinner = roundActions.WINNER;
        const prevWinner2 = roundActions.WINNER_2;
        const prevLoser = roundActions.LOSER;
        const prevPao = roundActions.PAO;

        const newRoundActions: HongKongActions = {};

        switch (type) {
            case HongKongRoundType.DEAL_IN:
                newRoundActions.WINNER = prevWinner;
                newRoundActions.LOSER = prevLoser;
                break;
            case HongKongRoundType.DEAL_IN_PAO:
                newRoundActions.WINNER = prevWinner;
                newRoundActions.LOSER = prevLoser;
                newRoundActions.PAO = prevPao;
                break;
            case HongKongRoundType.SELF_DRAW:
                newRoundActions.WINNER = prevWinner;
                break;
            case HongKongRoundType.SELF_DRAW_PAO:
                newRoundActions.WINNER = prevWinner;
                newRoundActions.PAO = prevPao;
                break;
            case HongKongRoundType.DECK_OUT:
                break;
        }

        if (hasSecondHand) {
            newRoundActions.WINNER_2 = prevWinner2;
        }

        setRoundActions(newRoundActions);
        setRoundType(type);
        setSecondHand(HK_UNDEFINED_HAND);

        if (!showPointInput()) {
            setHand(HK_UNDEFINED_HAND);
        }
    };

    const actionOnChange = (playerIndex: number, label: HongKongLabel) => {
        const newRoundActions: HongKongActions = { ...roundActions };
        newRoundActions[label] = playerIndex;
        setRoundActions(newRoundActions);
    };

    const handOnChange = (value: number) => {
        setHand(value);
    }

    const secondHandOnChange = (value: number) => {
        setSecondHand(value);
    }

    const submitRound = async () => {
        validateCreateHongKongRound(roundType, roundActions, hand, hasSecondHand, secondHand);
        const roundRequest = createHongKongRoundRequest(roundType, roundActions, hand, hasSecondHand, secondHand, game.currentRound!);
        await handleSubmitRound(roundRequest);
    }

    const getHongKongLabels = () => {
        let labels: [HongKongLabel, (number | undefined)[]][] = [];

        switch (roundType) {
            case HongKongRoundType.DEAL_IN:
            case HongKongRoundType.DEAL_IN_PAO:
                labels = [
                    [HongKongLabel.WINNER, [roundActions.WINNER]],
                    [HongKongLabel.LOSER, [roundActions.LOSER]],
                ];
                break;
            case HongKongRoundType.SELF_DRAW:
            case HongKongRoundType.SELF_DRAW_PAO:
                labels = [
                    [HongKongLabel.WINNER, [roundActions.WINNER]],
                ];
                break;
            case HongKongRoundType.DECK_OUT:
                break;
        }

        if (hasSecondHand) {
            labels.push([HongKongLabel.WINNER_2, [roundActions.WINNER_2]]);
        }

        return labels;
    }

    const getRecordingInterface = () => {
        return (
            <>
                <Row className="gx-2">
                    {HK_ROUND_TYPE_BUTTONS.map((button, idx) => (
                        <Col key={idx} xs={4}>
                            <ListToggleButton
                                index={idx}
                                name={button.name}
                                value={button.value}
                                checked={roundType.toString() === button.value}
                                onChange={(value) => roundTypeOnChange(value as unknown as HongKongRoundType)}
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
                {getHongKongLabels().map(([label, labelPlayerIds], idx) => (
                    <Row key={label} className="my-4">
                        <Col>
                            <h5>{HK_LABEL_MAP[label as HongKongLabel]}:</h5>
                            <PlayerButtonRow
                                players={players}
                                label={label as HongKongLabel}
                                labelPlayerIds={labelPlayerIds}
                                onChange={actionOnChange}
                            />
                        </Col>
                    </Row>
                ))}
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
                    {hongKongPointsWheel.map((wheel, idx) => (
                        <DropdownInput
                            key={wheel.label}
                            label={wheel.label}
                            data={wheel.data}
                            onChange={(value) => handOnChange(value)}
                        />
                    ))}
                </Row>
                {hasSecondHand && (
                    <Row>
                        <h5>Second Hand:</h5>
                        {hongKongPointsWheel.map((wheel, idx) => (
                            <DropdownInput
                                key={wheel.label}
                                label={wheel.label}
                                data={wheel.data}
                                onChange={(value) => secondHandOnChange(value)}
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
            <LegacyHongKongGameTable
                rounds={game.rounds as HongKongRound[]}
                players={players}
            />
        </Container>
    );
};

export default LegacyHongKongGame;
