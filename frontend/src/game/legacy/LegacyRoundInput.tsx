import { FC } from "react";
import { getLegacyRoundLabels, multiselectLabels } from "../../common/Utils";
import { Col, Row, ToggleButton } from "react-bootstrap";

type RoundInputProps = {
    gameVariant: GameVariant;
    players: any[];
    roundValue: RoundValue;
    onChange: (value: RoundValue) => void;
    isLegacy?: boolean;
};

const LegacyRoundInput: FC<RoundInputProps> = ({ gameVariant, players, roundValue, onChange }) => {
    const roundLabelOnChange = (index: number) => {
        const newRoundValue: any = {};
        newRoundValue.type = getLegacyRoundLabels(gameVariant)[index];

        newRoundValue.playerActions = {};
        players.forEach((player: any) => {
            newRoundValue.playerActions[player.id] = [];
        });

        onChange(newRoundValue);
    };

    const playerActionOnChange = (selector: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const newRoundValue: any = {};
        newRoundValue.type = roundValue.type;

        newRoundValue.playerActions = roundValue.playerActions;

        if (!event.target.checked) {
            newRoundValue.playerActions[event.target.value] = newRoundValue.playerActions[
                event.target.value
            ].filter((action: string) => action !== selector);
        } else {
            if (!multiselectLabels.includes(selector)) {
                for (const key in newRoundValue.playerActions) {
                    newRoundValue.playerActions[key] = newRoundValue.playerActions[key].filter(
                        (action: string) => action !== selector,
                    );
                }
            }

            newRoundValue.playerActions[event.target.value].push(selector);
        }

        onChange(newRoundValue);
    };

    return (
        <>
            <Row className="gx-2">
                {getLegacyRoundLabels(gameVariant).map((label, idx) => (
                    <Col key={idx} xs={4}>
                        <ToggleButton
                            id={`radio-${idx}`}
                            type="radio"
                            variant="outline-primary"
                            name="round-button"
                            className="my-1 w-100"
                            value={label.value}
                            checked={roundValue.type.value === label.value}
                            onChange={() => roundLabelOnChange(idx)}
                        >
                            {label.name}
                        </ToggleButton>
                    </Col>
                ))}
            </Row>
            {roundValue.type.selectors.map((selector: string, idx: number) => (
                <Row key={idx} className="my-4">
                    <Col>
                        <h5>{selector}:</h5>
                        {players.map((player, idx) => (
                            <ToggleButton
                                key={idx}
                                id={`name-${selector}-${idx}`}
                                type={multiselectLabels.includes(selector) ? "checkbox" : "radio"}
                                variant="outline-primary"
                                name={selector + "-button"}
                                className="mx-1 my-1"
                                value={player.id}
                                checked={roundValue.playerActions[player.id].includes(selector)}
                                onChange={(e) => playerActionOnChange(selector, e)}
                            >
                                {player.username}
                            </ToggleButton>
                        ))}
                    </Col>
                </Row>
            ))}
        </>
    );
};

export default LegacyRoundInput;
