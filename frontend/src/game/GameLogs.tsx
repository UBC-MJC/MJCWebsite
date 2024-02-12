import React, { FC, useEffect, useState } from "react";
import Game from "./Game";
import { getCurrentGamesAPI } from "../api/GameAPI";
import { AxiosError } from "axios";
import { Button, Card, Container, Row } from "react-bootstrap";
import { getGameTypeString } from "../common/Utils";

export const GameLogs: FC<GameTypeProp> = ({ gameVariant }) => {
    const [currentGames, setCurrentGames] = useState<Game[]>([]);

    useEffect(() => {
        getCurrentGamesAPI(gameVariant)
            .then((response) => {
                console.log("Current games: ");
                console.log(response.data);
                setCurrentGames(response.data);
            })
            .catch((error: AxiosError) => {
                alert(`Error fetching current games: ${error.response?.data}`);
            });
    }, [gameVariant]);

    function getGamePlayers(game: Game) {
        const usernames = game.players.map((player: GamePlayer) => player.username);
        return usernames.toString();
    }

    return (
        <Container>
            <h1 className="my-4">Current {getGameTypeString(gameVariant)} Games</h1>
            <Row>
                {currentGames.map((game, idx) => (
                    <Card key={idx} className="text-center">
                        <Card.Body>
                            <Card.Title>Game {game.id}</Card.Title>
                            <Card.Text>{getGamePlayers(game)}</Card.Text>
                            <Card.Link href={"../" + gameVariant + "/" + game.id}>
                                Open Game
                            </Card.Link>
                        </Card.Body>
                    </Card>
                ))}
            </Row>
        </Container>
    );
};
