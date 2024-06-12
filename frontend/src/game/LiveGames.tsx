import React, { FC, useEffect, useState } from "react";
import { getLiveGamesAPI } from "../api/GameAPI";
import { AxiosError } from "axios";
import { Card, Col, Container, Row } from "react-bootstrap";
import { getGameVariantString } from "../common/Utils";
import { useNavigate } from "react-router-dom";
import { gameRoundString } from "./common/constants";
import GameSummaryBody from "./common/GameSummaryBody";

export const LiveGames: FC<GameVariantProp> = ({ gameVariant }) => {
    const navigate = useNavigate();
    const [liveGames, setLiveGames] = useState<Game[]>([]);

    useEffect(() => {
        getLiveGamesAPI(gameVariant)
            .then((response) => {
                setLiveGames(response.data);
            })
            .catch((error: AxiosError) => {
                alert(`Error fetching current games: ${error.response?.data}`);
            });
    }, [gameVariant]);

    const getCardHeader = (game: Game) => {
        return (
            <div style={{ fontWeight: "bold" }}>
                Game {game.id} - {gameRoundString(game, gameVariant)}
            </div>
        );
    };

    const navigateToGame = (gameId: string) => {
        navigate(`/games/${gameVariant}/${gameId}`);
    };

    return (
        <>
            <h1 className="my-4">Live {getGameVariantString(gameVariant)} Games</h1>
            <Container>
                <Row>
                    {liveGames.map((game, idx) => (
                        <Col key={idx} className="text-center my-2" xs={12} lg={6}>
                            <Card className="game-card" onClick={() => navigateToGame(game.id)}>
                                <Card.Header style={{ fontSize: 18 }}>
                                    {getCardHeader(game)}
                                </Card.Header>
                                <Card.Body>
                                    <GameSummaryBody game={game} gameVariant={gameVariant} />
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </>
    );
};
