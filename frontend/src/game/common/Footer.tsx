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
        <Container fluid className={"my-4 position-sticky bottom-0 bg-body"}>
            {gameVariant === "jp" && (
                <Row className={"my-1"}>
                    <h4 className="my-2">
                        Riichi sticks:{" "}
                        {getRiichiStickCount(game.rounds as JapaneseRound[], riichiList)}
                    </h4>
                </Row>
            )}
            <Row className={"row-cols-4 align-items-end"}>
                {getScoresWithPlayers(game, gameVariant).map(({ username, score }, idx) => (
                    <Col key={idx} className={"my-2"}>
                        <div>{username}</div>
                        <div>
                            {riichiList.includes(idx) && (
                                <img src={riichiStick} className={"w-75"} />
                            )}
                        </div>
                        <h2 className="my-0">{score - Number(riichiList.includes(idx)) * 1000}</h2>
                        <div>{game.eloDeltas[game.players[idx].id].toFixed(1)}</div>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};
