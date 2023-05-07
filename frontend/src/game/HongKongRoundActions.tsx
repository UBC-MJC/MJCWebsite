import {FC, useState} from "react";
import RoundInputFigure from "./RoundInputFigure";
import {Col, Row, ToggleButton} from "react-bootstrap";
import {hongKongRoundLabels} from "../common/Utils";

const HongKongRoundActions: FC<RoundInputProps> = ({players}) => {
    const [roundValue, setRoundValue] = useState(hongKongRoundLabels[0].value);

    return (
        <>
            <Col xs={12} lg={8}>
                <RoundInputFigure players={players} />
            </Col>
            <Col xs={12} lg={4} className="d-flex justify-content-center flex-column">
                <Row className="justify-content-center mt-1">
                    {hongKongRoundLabels.map((label, idx) => (
                        <Col key={idx} xs={6} lg={12}>
                            <ToggleButton
                                id={`radio-${idx}`}
                                type="radio"
                                variant="outline-primary"
                                name="radio"
                                className="w-100 my-1"
                                value={label.value}
                                checked={roundValue === label.value}
                                onChange={(e) => setRoundValue(e.currentTarget.value)}
                            >
                                {label.name}
                            </ToggleButton>
                        </Col>
                    ))}
                </Row>
            </Col>
        </>
    )
}

export default HongKongRoundActions
