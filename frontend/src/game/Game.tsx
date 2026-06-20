import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AxiosError } from "axios";
import type { GameVariant, Game, GamePlayer, RoundByVariant } from "@/types";
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
import {
    Button,
    Stack,
    Container,
    Typography,
    Box,
    Card,
    Chip,
    Tooltip,
} from "@mui/material";
import { keyframes } from "@mui/system";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import UndoIcon from "@mui/icons-material/Undo";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

// Gentle "breathing" pulse for the live indicator dot (matches LiveGames).
const pulse = keyframes`
    0%   { opacity: 1;    transform: scale(1);   }
    50%  { opacity: 0.35; transform: scale(0.8); }
    100% { opacity: 1;    transform: scale(1);   }
`;

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
    const diffHours = Math.floor(diffMins / 60);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const Game = <T extends GameVariant>() => {
    const { id, variant: variantParam } = useParams();
    const { player, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const gameId = Number(id);

    // Validate and cast variant to GameVariant type
    const variant = (validateGameVariant(variantParam) ? variantParam : undefined) as T | undefined;

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

    const handleSubmitRound = async (roundRequest: RoundByVariant<T>) => {
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
                    handleSubmitRound={
                        handleSubmitRound as (round: RoundByVariant<"jp">) => Promise<void>
                    }
                />
            );
        } else if (variant === "hk") {
            return (
                <LegacyHongKongGame
                    enableRecording={isRecording(game)}
                    players={getOrderedPlayers()}
                    game={game as Game<"hk">}
                    handleSubmitRound={
                        handleSubmitRound as (round: RoundByVariant<"hk">) => Promise<void>
                    }
                />
            );
        }
    };

    if (isNaN(gameId) || !validateGameVariant(variant)) {
        navigate("/games/not-found");
        return;
    } else if (typeof game === "undefined") {
        return <LoadingFallback minHeight="50vh" message="Loading game..." />;
    } else if (loading) {
        return <LoadingFallback />;
    }
    const canUpdateGame =
        game.status === "IN_PROGRESS" && (isRecording(game) || (player && player.admin));
    const spectatorPadding: number = canUpdateGame ? 0 : 12;
    return (
        <Container sx={{ pb: { xs: 6 + spectatorPadding, sm: 10 + spectatorPadding } }}>
            <Stack spacing={3}>
                <Card sx={{ overflow: "hidden" }}>
                    <Box
                        sx={{
                            bgcolor: "action.hover",
                            px: { xs: 2, md: 3 },
                            py: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 1.5,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
                            {game.status === "IN_PROGRESS" && (
                                <Box
                                    sx={{
                                        width: 11,
                                        height: 11,
                                        borderRadius: "50%",
                                        bgcolor: "primary.main",
                                        flexShrink: 0,
                                        animation: `${pulse} 1.6s ease-in-out infinite`,
                                    }}
                                />
                            )}
                            <Typography
                                variant="h1"
                                sx={{ fontSize: { xs: "1.6rem", md: "2rem" }, fontWeight: 800 }}
                            >
                                {getGameVariantString(variant, game.type)}
                            </Typography>
                            <Tooltip title={new Date(game.createdAt).toLocaleString()} arrow>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        color: "text.secondary",
                                        flexShrink: 0,
                                    }}
                                >
                                    <AccessTimeIcon sx={{ fontSize: "1.15rem" }} />
                                    <Typography variant="body2" sx={{ whiteSpace: "nowrap", fontSize: "1rem" }}>
                                        {formatDate(game.createdAt)}
                                    </Typography>
                                </Box>
                            </Tooltip>
                        </Box>
                        {game.status === "IN_PROGRESS" ? (
                            <Chip
                                label={gameRoundString(game, variant)}
                                color="primary"
                                variant="outlined"
                                sx={{ height: 40, fontSize: "0.95rem", fontWeight: 600 }}
                            />
                        ) : (
                            <Chip
                                label="Finished"
                                color="success"
                                variant="outlined"
                                sx={{ height: 40, fontSize: "0.95rem", fontWeight: 600 }}
                            />
                        )}
                    </Box>
                </Card>

                {getLegacyDisplayGame(game)}
                {canUpdateGame && (
                    <Box sx={{ pb: { xs: 18, sm: 16 } }}>
                        <Card sx={{ p: 1.5 }}>
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    fontSize: "0.78rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                    color: "text.secondary",
                                    mb: 1.25,
                                    ml: 0.5,
                                }}
                            >
                                Game Actions
                            </Typography>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<UndoIcon />}
                                    disabled={game.rounds.length == 0}
                                    fullWidth
                                    onClick={() => handleDeleteRound()}
                                >
                                    Delete Last Round
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteOutlineIcon />}
                                    fullWidth
                                    onClick={() => handleDeleteGame()}
                                >
                                    Delete Game
                                </Button>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<CheckCircleOutlineIcon />}
                                    disabled={!isGameEnd(game, variant)}
                                    fullWidth
                                    onClick={() => handleSubmitGame()}
                                >
                                    Submit Game
                                </Button>
                            </Stack>
                        </Card>
                    </Box>
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