import { FC, useState } from "react";
import { hongKongRoundLabels, japaneseRoundLabels } from "@/common/Utils";
import { Col, Container, Row, ToggleButton } from "react-bootstrap";
import RoundInputFigure from "./RoundInputFigure";
import type { GameVariant, GamePlayer, RoundValue, RoundType } from "@/types";

interface RoundInputProps {
    gameVariant: GameVariant;
    players: GamePlayer[];
    roundValue: RoundValue;
    onChange: (value: RoundValue) => void;
    isLegacy?: boolean;
}

const NewRoundInput: FC<RoundInputProps> = ({ gameVariant, players }) => {
    const [roundValue, setRoundValue] = useState<string>(() => {
        switch (gameVariant) {
            case "jp":
                return japaneseRoundLabels[0].value;
            case "hk":
                return hongKongRoundLabels[0].value;
        }
    });

    const getRoundLabels = () => {
        switch (gameVariant) {
            case "jp":
                return japaneseRoundLabels;
            case "hk":
                return hongKongRoundLabels;
        }
    };

    return (
        <Container fluid="lg">
            <Row className="justify-content-center">
                <Col xs={12} lg={4} className="d-flex justify-content-center flex-column">
                    <Row className="justify-content-center mt-1">
                        {getRoundLabels().map((label: RoundType, idx: number) => (
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
                <Col xs={12} lg={8}>
                    <RoundInputFigure players={players} />
                </Col>
            </Row>
        </Container>
    );
};
