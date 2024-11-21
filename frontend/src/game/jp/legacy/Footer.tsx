import React, { FC } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { generateJapaneseCurrentScore } from "../controller/JapaneseRound";
import riichiStick from "../../../assets/riichiStick.png";

export const Footer: FC<{
    riichiStickCount: number;
    game: Game;
    players: GamePlayer[];
    riichiList: number[];
}> = ({ riichiStickCount, game, players, riichiList }) => {
    return (
        <Container fluid className={"my-4 position-sticky bottom-0 bg-body"}>
            <Row className={"my-1"}>
                <h4 className="my-2">Riichi sticks: {riichiStickCount}</h4>
            </Row>
            <Row className={"row-cols-4 align-items-end"}>
                {generateJapaneseCurrentScore(game.rounds as JapaneseRound[]).map((score, idx) => (
                    <Col key={idx} className={"my-2"}>
                        <div>@{players[idx].username}</div>
                        <div>{players[idx].fullName}</div>
                        <div>
                            {riichiList.includes(idx) && (
                                <img src={riichiStick} className={"w-75"} />
                            )}
                        </div>
                        <h2 className="my-0">{score - Number(riichiList.includes(idx)) * 1000}</h2>
                        <div>{game.eloDeltas[players[idx].id].toFixed(1)}</div>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};
