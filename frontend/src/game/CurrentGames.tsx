import React, { FC, useEffect, useState } from "react";
import Game from "./Game";
import { getCurrentGamesAPI } from "../api/GameAPI";
import { AxiosError } from "axios";
import { Container, Row } from "react-bootstrap";
import { getGameTypeString } from "../common/Utils";

export const CurrentGames: FC<GameTypeProp> = ({ gameVariant }) => {
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
            <h1>Current {getGameTypeString(gameVariant)} Games</h1>
            <Row>
                {currentGames.map((game, idx) => (
                    <div key={idx}>
                        <p>
                            <b>{game.id}</b>{" "}
                            <a href={"../" + gameVariant + "/" + game.id}>{getGamePlayers(game)}</a>
                        </p>
                    </div>
                ))}
            </Row>
        </Container>
    );
};
