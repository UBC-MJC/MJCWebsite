import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AxiosError } from "axios";
import type {
    GameVariant,
    Game,
    GamePlayer,
    RoundByVariant,
    JapaneseRound,
    HongKongRound,
} from "@/types";
import {
    addRoundAPI,
    deleteGameAPI,
    deleteRoundAPI,
    getGameAPI,
    submitGameAPI,
} from "@/api/GameAPI";
import { AuthContext } from "@/common/AuthContext";
import { getGameVariantString, validateGameVariant } from "@/common/Utils";
import { logger } from "@/common/logger";
import LoadingFallback from "@/common/LoadingFallback";
import alert from "@/common/AlertDialog";
import confirmDialog from "@/common/ConfirmationDialog";
import LegacyJapaneseGame from "./jp/legacy/LegacyJapaneseGame";
import LegacyHongKongGame from "./hk/legacy/LegacyHongKongGame";
import { gameRoundString, isGameEnd } from "./common/constants";
import { baseUrl } from "@/api/APIUtils";
import { Button, Stack, Container, Typography } from "@mui/material";

const Game = <T extends GameVariant>() => {
    const { id, variant: variantParam } = useParams();
    const { player } = useContext(AuthContext);
    const navigate = useNavigate();
    const gameId = Number(id);

    // Validate and cast variant to GameVariant type
    const variant = (validateGameVariant(variantParam) ? variantParam : undefined) as
        | GameVariant
        | undefined;

    const [game, setGame] = useState<Game<T> | undefined>(undefined);

    useEffect(() => {
        const fetchGame = async () => {
            if (isNaN(gameId) || !variant) {
                navigate("/games/not-found");
                return;
            }

            try {
                const response = await getGameAPI(gameId, variant);
                setGame(response.data);
            } catch (error) {
                logger.error("Error fetching game: ", (error as AxiosError).response?.data);
                if ((error as AxiosError).response?.status === 404) {
                    navigate("/games/not-found");
                    return;
                }
            }
        };
        fetchGame();
    }, [gameId, navigate, variant]);

    useEffect(() => {
        // Only setup EventSource for spectators (not the recorder) watching live games
        if (game && (!player || game.recordedById !== player.id) && game.status === "IN_PROGRESS") {
            const eventSource = new EventSource(baseUrl + `/games/${variant}/${game.id}/live`);

            eventSource.onmessage = (event) => {
                const gameResult = JSON.parse(event.data);
                setGame(gameResult);
            };

            eventSource.onerror = () => {
                // Close the connection on error and don't retry
                eventSource.close();
            };

            // Cleanup function to close EventSource when component unmounts
            return () => {
                eventSource.close();
            };
        }
    }, [game?.id, game?.status, player, variant]);

    const handleSubmitRound = async (roundRequest: JapaneseRound | HongKongRound) => {
        try {
            const response = await addRoundAPI(gameId, variant!, roundRequest);
            setGame(response.data);
        } catch (error) {
            alert(`Add Round Error: ${(error as AxiosError).response?.data}`);
        }
    };

    const handleDeleteRound = async () => {
        const response = await confirmDialog(
            "Are you sure you want to delete the previous round?",
            {
                okText: "Delete",
                okButtonStyle: "error",
            },
        );
        if (!response) {
            return;
        }

        try {
            const response = await deleteRoundAPI(gameId, variant!);
            setGame(response.data);
        } catch (e) {
            const error = e as Error;
            await alert(`Delete Round Error: ${error.message}`);
        }
    };

    const handleDeleteGame = async () => {
        const response = await confirmDialog("Are you sure you want to delete this game?", {
            okText: "Delete",
            okButtonStyle: "error",
        });
        if (!response) {
            return;
        }

        try {
            await deleteGameAPI(gameId, variant!);
            await alert(`Game Deleted`);
            navigate("/");
        } catch (e) {
            const error = e as Error;
            await alert(`Delete Game Error: ${error.message}`);
        }
    };

    const handleSubmitGame = async () => {
        const response = await confirmDialog("Are you sure you want to submit this game?", {
            okText: "Submit",
            okButtonStyle: "success",
        });
        if (!response) {
            return;
        }

        try {
            await submitGameAPI(gameId, variant!);
            await alert(`Game Submitted`);
            const tempGame = { ...game! };
            tempGame.status = "FINISHED";
            setGame(tempGame);
        } catch (error) {
            await alert(`Delete Game Error: ${(error as AxiosError).message}`);
        }
    };

    const getOrderedPlayers = (): GamePlayer[] => {
        if (!game) {
            return [];
        }
        return game.players.slice();
    };
    const isRecording = (game: Game<T>): boolean => {
        return typeof player !== "undefined" && game.recordedById === player.id;
    };

    const getLegacyDisplayGame = (game: Game<T>) => {
        if (variant === "jp") {
            return (
                <LegacyJapaneseGame
                    enableRecording={isRecording(game)}
                    players={getOrderedPlayers()}
                    game={game as Game<"jp">}
                    handleSubmitRound={handleSubmitRound}
                />
            );
        } else if (variant === "hk") {
            return (
                <LegacyHongKongGame
                    enableRecording={isRecording(game)}
                    players={getOrderedPlayers()}
                    game={game as Game<"hk">}
                    handleSubmitRound={handleSubmitRound}
                />
            );
        }
    };

    if (isNaN(gameId) || !validateGameVariant(variant)) {
        navigate("/games/not-found");
        return;
    } else if (typeof game === "undefined") {
        return <LoadingFallback minHeight="50vh" message="Loading game..." />;
    }
    const canUpdateGame: boolean =
        game.status === "IN_PROGRESS" &&
        (isRecording(game) || (player && player.admin));
    const spectatorPadding: number = canUpdateGame ? 0 : 12;
    return (
        <Container sx={{ pb: { xs: 6 + spectatorPadding, sm: 10 + spectatorPadding } }}>
            <Stack>
                <Typography variant="h1">{getGameVariantString(variant, game.type)}</Typography>
                {game.status === "IN_PROGRESS" && (
                    <Typography variant="h2" color="text.secondary">
                        {gameRoundString(game, variant)}
                    </Typography>
                )}
                {getLegacyDisplayGame(game)}
                {canUpdateGame && (
                    <Stack direction={{ xs: "column", sm: "row" }} sx={{ pb: { xs: 18, sm: 16 } }}>
                        <Button
                            variant="contained"
                            color="error"
                            disabled={game.rounds.length == 0}
                            fullWidth
                            onClick={() => handleDeleteRound()}
                        >
                            Delete Last Round
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            fullWidth
                            onClick={() => handleDeleteGame()}
                        >
                            Delete Game
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            disabled={!isGameEnd(game, variant)}
                            fullWidth
                            onClick={() => handleSubmitGame()}
                        >
                            Submit Game
                        </Button>
                    </Stack>
                )}
            </Stack>
        </Container>
    );
};

export interface LegacyGameProps<T extends GameVariant> {
    enableRecording: boolean;
    players: GamePlayer[];
    game: Game<T>;
    handleSubmitRound: (roundRequest: RoundByVariant<T>) => Promise<void>;
}

export default Game;
