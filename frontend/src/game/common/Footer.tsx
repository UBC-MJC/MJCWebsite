import React, { FC } from "react";
import { Col, Container, Row } from "react-bootstrap";
import riichiStick from "../../assets/riichiStick.png";
import { getRiichiStickCount, getScoresWithPlayers } from "../../common/Utils";

export const Footer: FC<{
    game: Game;
    gameVariant: GameVariant;
    riichiList: number[];
}> = ({ game, gameVariant, riichiList }) => {
    return (
        <Container>
            {gameVariant === "jp" && (
                <Row>
                    <h5>
                        Riichi sticks:{" "}
                        {getRiichiStickCount(game.rounds as JapaneseRound[], riichiList)}
                    </h5>
                </Row>
            )}
            <Row>
                {getScoresWithPlayers(game, gameVariant).map(
                    ({ username, score, eloDelta }, idx) => (
                        <Col key={idx}>
                            <div>{username}</div>
                            <div>
                                {riichiList.includes(idx) && (
                                    <img src={riichiStick} />
                                )}
                            </div>
                            <h2 >
                                {score - Number(riichiList.includes(idx)) * 1000}
                            </h2>
                            <div>{eloDelta.toFixed(1)}</div>
                        </Col>
                    ),
                )}
            </Row>
        </Container>
    );
};
