import React, { FC } from "react";
import { Card as MuiCard, CardHeader, CardContent, Container, Stack } from "@mui/material";
import { getGameVariantString } from "../common/Utils";
import { useNavigate } from "react-router-dom";
import { gameRoundString } from "./common/constants";
import GameSummaryBody from "./common/GameSummaryBody";
import { useLiveGames } from "../hooks/GameHooks";

export const LiveGames: FC<GameCreationProp> = ({ gameVariant }) => {
    const navigate = useNavigate();
    const { isPending, error, data: liveGames } = useLiveGames(gameVariant);

    const getCardHeader = (game: Game) => {
        return (
            <div style={{ fontWeight: "bold" }}>
                {getGameVariantString(gameVariant, game.type)} Game {game.id} -{" "}
                {gameRoundString(game, gameVariant)}
            </div>
        );
    };

    const navigateToGame = (gameId: string) => {
        navigate(`/games/${gameVariant}/${gameId}`);
    };
    if (isPending) {
        return <>Loading...</>;
    }
    if (error) {
        return <>Error</>;
    }
    return (
        <>
            <h1>{getGameVariantString(gameVariant)} Games</h1>
            <Container>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                    {liveGames.map((game, idx) => (
                        <Stack key={idx} direction="column">
                            <MuiCard onClick={() => navigateToGame(game.id)}>
                                <CardHeader title={getCardHeader(game)} />
                                <CardContent>
                                    <GameSummaryBody game={game} gameVariant={gameVariant} />
                                </CardContent>
                            </MuiCard>
                        </Stack>
                    ))}
                </Stack>
            </Container>
        </>
    );
};
