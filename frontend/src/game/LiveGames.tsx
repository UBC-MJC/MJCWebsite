import React, { FC } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { getGameVariantString } from "@/common/Utils";
import { Link } from "react-router-dom";
import { gameRoundString } from "./common/constants";
import GameSummaryBody from "./common/GameSummaryBody";
import { useLiveGames } from "@/hooks/GameHooks";
import type { GameCreationProp, Game } from "@/types";

export const LiveGames: FC<GameCreationProp> = ({ gameVariant }) => {
    const { isPending, error, data: liveGames } = useLiveGames(gameVariant);

    const getCardHeader = (game: Game<typeof gameVariant>) => {
        return (
            <div style={{ fontWeight: "bold" }}>
                {getGameVariantString(gameVariant, game.type)} Game {game.id} -{" "}
                {gameRoundString(game, gameVariant)}
            </div>
        );
    };

    if (isPending) {
        return <>Loading...</>;
    }
    if (error) {
        return <>Error</>;
    }
    return (
        <>
            <h1 className="my-4">Live {getGameVariantString(gameVariant)} Games</h1>
            <Container>
                <Row>
                    {liveGames.map((game, idx) => (
                        <Col key={idx} className="text-center my-2" xs={12} lg={6}>
                            <Link
                                to={`/games/${gameVariant}/${game.id}`}
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                <Card className="game-card" style={{ cursor: "pointer" }}>
                                    <Card.Header style={{ fontSize: 18 }}>
                                        {getCardHeader(game)}
                                    </Card.Header>
                                    <Card.Body>
                                        <GameSummaryBody game={game} gameVariant={gameVariant} />
                                    </Card.Body>
                                </Card>
                            </Link>
                        </Col>
                    ))}
                </Row>
            </Container>
        </>
    );
};
