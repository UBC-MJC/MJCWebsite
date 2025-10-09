import { FC } from "react";
import { Col, Container, Ratio, Row } from "react-bootstrap";
import GamePlayerGridCell from "./GamePlayerGridCell";
import riichiStick from "@/assets/riichiStick.png";
import type { GamePlayer } from "@/types";

interface RoundInputFigureProps {
    players: GamePlayer[];
}
const RoundInputFigure: FC<RoundInputFigureProps> = ({ players }) => {
    return (
        <Row className="justify-content-center">
            <Col xs sm={10} md={8} lg={9} xl={8} className="p-0 game-round-input">
                <Container className="d-flex flex-column p-0 game-round-input-grid">
                    <Row>
                        <Col></Col>
                        <Col>
                            <GamePlayerGridCell player={players[2]} />
                        </Col>
                        <Col></Col>
                    </Row>
                    <Row>
                        <Col>
                            <GamePlayerGridCell player={players[3]} />
                        </Col>
                        <Col></Col>
                        <Col>
                            <GamePlayerGridCell player={players[1]} />
                        </Col>
                    </Row>
                    <Row>
                        <Col></Col>
                        <Col>
                            <GamePlayerGridCell player={players[0]} />
                        </Col>
                        <Col></Col>
                    </Row>
                </Container>

                <Ratio aspectRatio="1x1">
                    <svg viewBox="0 0 100 100">
                        <polygon
                            points="0,100 100,100 67.5,67.5 32.5,67.5"
                            onClick={() => console.log("bot")}
                        />
                        <polygon
                            points="100,0 100,100 67.5,67.5 67.5,32.5"
                            onClick={() => console.log("right")}
                        />
                        <polygon
                            points="0,0 100,0 67.5,32.5 32.5,32.5"
                            onClick={() => console.log("top")}
                        />
                        <polygon
                            points="0,0 0,100 32.5,67.5 32.5,32.5"
                            onClick={() => console.log("left")}
                        />
                        <image href={riichiStick} width={24} x={38} y={35} />
                        <image href={riichiStick} width={24} x={38} y={62} />
                        <image
                            href={riichiStick}
                            width={24}
                            x={38}
                            y={35}
                            transform="rotate(90, 50, 50)"
                        />
                        <image
                            href={riichiStick}
                            width={24}
                            x={38}
                            y={35}
                            transform="rotate(-90, 50, 50)"
                        />
                    </svg>
                </Ratio>
            </Col>
        </Row>
    );
};

export default RoundInputFigure;
