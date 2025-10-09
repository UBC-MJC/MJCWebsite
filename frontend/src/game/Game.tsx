import { FC, useContext, useEffect, useState } from "react";
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
import alert from "@/common/AlertDialog";
import confirmDialog from "@/common/ConfirmationDialog";
import LegacyJapaneseGame from "./jp/legacy/LegacyJapaneseGame";
import LegacyHongKongGame from "./hk/legacy/LegacyHongKongGame";
import { gameRoundString, isGameEnd } from "./common/constants";
import { baseUrl } from "@/api/APIUtils";
import { Button, Stack, Container } from "@mui/material";

const Game: FC = <T extends GameVariant>() => {
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
        if (isNaN(gameId) || !variant) {
            navigate("/games/not-found");
            return;
        }

        getGameAPI(gameId, variant)
            .then((response) => {
                setGame(response.data);
            })
            .catch((error: AxiosError) => {
                console.error("Error fetching game: ", error.response?.data);
                if (error.response?.status === 404) {
                    navigate("/games/not-found");
                    return;
                }
            });
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
        addRoundAPI(gameId, variant!, roundRequest)
            .then((response) => {
                setGame(response.data);
            })
            .catch((error: AxiosError) => {
                alert(`Add Round Error: ${error.response?.data}`);
            });
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
        } catch (e) {
            const error = e as Error;
            await alert(`Delete Game Error: ${error.message}`);
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

    if (isNaN(gameId)) {
        return (
            <div>
                <h1>Game Not Found</h1>
            </div>
        );
    } else if (!validateGameVariant(variant)) {
        return (
            <div>
                <h1>Invalid Game Variant</h1>
            </div>
        );
    } else if (typeof game === "undefined") {
        return (
            <div>
                <h1>Loading...</h1>
            </div>
        );
    }
    return (
        <Container sx={{ width: "100%", paddingBottom: "10rem", position: "relative" }}>
            <h1>
                {getGameVariantString(variant, game.type)} Game
                {game.status === "IN_PROGRESS" && " - " + gameRoundString(game, variant)}
            </h1>
            {getLegacyDisplayGame(game)}
            {game.status === "IN_PROGRESS" && (isRecording(game) || player?.admin) && (
                <Stack
                    direction="row"
                    spacing={2}
                    width="75%"
                    margin="auto"
                    justifyContent={"center"}
                >
                    <Button
                        variant="contained"
                        color="error"
                        disabled={game.rounds.length == 0}
                        onClick={() => handleDeleteRound()}
                    >
                        Delete last Hand
                    </Button>
                    <Button variant="contained" color="error" onClick={() => handleDeleteGame()}>
                        Delete Game
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        disabled={!isGameEnd(game, variant)}
                        onClick={() => handleSubmitGame()}
                    >
                        Submit Game
                    </Button>
                </Stack>
            )}
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
