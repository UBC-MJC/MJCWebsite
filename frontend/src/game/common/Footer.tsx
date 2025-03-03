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
        <Container className={"position-fixed bottom-0 left-0 w-100 mt-auto bg-body z-2"} style={{transform: "translate(calc(50vw - 50%))"}}>
            {gameVariant === "jp" && (
                <Row className={"mt-2"}>
                    <h5 className={"my-0"}>
                        Riichi sticks:{" "}
                        {getRiichiStickCount(game.rounds as JapaneseRound[], riichiList)}
                    </h5>
                </Row>
            )}
            <Row className={"row-cols-4 align-items-end mb-2"}>
                {getScoresWithPlayers(game, gameVariant).map(({ username, score, eloDelta }, idx) => (
                    <Col key={idx} className={"my-2"}>
                        <div>{username}</div>
                        <div>
                            {riichiList.includes(idx) && (
                                <img src={riichiStick} className={"w-75"} />
                            )}
                        </div>
                        <h2 className="my-0">{score - Number(riichiList.includes(idx)) * 1000}</h2>
                        <div>{eloDelta.toFixed(1)}</div>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};
