import React, { FC, useEffect, useState } from "react";
import Game from "./Game";
import { getCurrentGamesAPI } from "../api/GameAPI";
import { AxiosError } from "axios";
import { Button, Card, Col, Container, Row } from "react-bootstrap";
import { getGameTypeString, mapWindToCharacter } from "../common/Utils";
import { useNavigate } from "react-router-dom";
import { generateJapaneseCurrentScore } from "./jp/controller/JapaneseRound";
import { generateHongKongCurrentScore } from "./hk/controller/HongKongRound";
import { gameRoundString } from "./common/constants";

export const CurrentGames: FC<GameTypeProp> = ({ gameVariant }) => {
    const navigate = useNavigate();
    const [currentGames, setCurrentGames] = useState<Game[]>([]);

    useEffect(() => {
        getCurrentGamesAPI(gameVariant)
            .then((response) => {
                setCurrentGames(response.data);
            })
            .catch((error: AxiosError) => {
                alert(`Error fetching current games: ${error.response?.data}`);
            });
    }, [gameVariant]);

    const getCardHeader = (game: Game) => {
        return (
            <div style={{ fontWeight: "bold" }}>
                Game {game.id} - {gameRoundString(game)}
            </div>
        );
    };

    const getCardBody = (game: Game) => {
        let scores: number[];
        if (gameVariant === "jp") {
            scores = generateJapaneseCurrentScore(game.rounds as JapaneseRound[]);
        } else {
            scores = generateHongKongCurrentScore(game.rounds as HongKongRound[]);
        }

        const scoresWithPlayers = scores.map((score, idx) => {
            return {
                username: game.players[idx].username,
                score: score,
            };
        });
        scoresWithPlayers.sort((a, b) => b.score - a.score);

        return (
            <Row>
                {scoresWithPlayers.map((score, idx) => (
                    <Col key={idx} xs={6} className="px-3">
                        <div className="d-flex justify-content-between">
                            <div>
                                {mapIndextoPlace(idx)} - {score.username}
                            </div>
                            <div>{score.score}</div>
                        </div>
                    </Col>
                ))}
            </Row>
        );
    };

    const mapIndextoPlace = (idx: number) => {
        switch (idx) {
            case 0:
                return "1st";
            case 1:
                return "2nd";
            case 2:
                return "3rd";
            default:
                return `${idx + 1}th`;
        }
    };

    const navigateToGame = (gameId: string) => {
        navigate(`/games/${gameVariant}/${gameId}`);
    };

    return (
        <>
            <h1 className="my-4">Current {getGameTypeString(gameVariant)} Games</h1>
            <Container>
                <Row>
                    {currentGames.map((game, idx) => (
                        <Col key={idx} className="text-center my-2" xs={12} lg={4}>
                            <Card className="game-card" onClick={() => navigateToGame(game.id)}>
                                <Card.Header>{getCardHeader(game)}</Card.Header>
                                <Card.Body>{getCardBody(game)}</Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </>
    );
};
