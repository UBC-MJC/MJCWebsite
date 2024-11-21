import { FC, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AxiosError } from "axios";
import {
    addRoundAPI,
    deleteGameAPI,
    deleteRoundAPI,
    getGameAPI,
    submitGameAPI,
} from "../api/GameAPI";
import { AuthContext } from "../common/AuthContext";
import { getGameVariantString, validateGameVariant } from "../common/Utils";
import alert from "../common/AlertDialog";
import confirmDialog from "../common/ConfirmationDialog";
import LegacyJapaneseGame from "./jp/legacy/LegacyJapaneseGame";
import LegacyHongKongGame from "./hk/legacy/LegacyHongKongGame";
import { Col, Container, Row } from "react-bootstrap";
import { gameRoundString, isGameEnd } from "./common/constants";
import { baseUrl } from "../api/APIUtils";
import { Button } from "@mui/material";

const Game: FC = () => {
    const { id, variant } = useParams();
    const { player } = useContext(AuthContext);
    const navigate = useNavigate();
    const gameId = Number(id);

    const [game, setGame] = useState<Game | undefined>(undefined);
    const [listening, setListening] = useState(false);

    if (isNaN(gameId) || !validateGameVariant(variant)) {
        navigate("/games/not-found");
        return <></>;
    }

    useEffect(() => {
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
    }, [gameId, navigate]);

    useEffect(() => {
        if (
            game &&
            (!player || game.recordedById !== player.id) &&
            game.status === "IN_PROGRESS" &&
            !listening
        ) {
            const eventSource = new EventSource(baseUrl + `/games/${variant}/${game.id}/live`);

            eventSource.onmessage = (event) => {
                const gameResult = JSON.parse(event.data);
                setGame(gameResult);
            };

            eventSource.onerror = (event) => {
                console.error("EventSource Error: ", event);
                eventSource.close();
                setListening(false);
            };
            setListening(true);
        }
    }, [listening, game, player, variant]);

    const handleSubmitRound = async (roundRequest: any) => {
        addRoundAPI(player!.authToken, gameId, variant, roundRequest)
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
                okButtonStyle: "danger",
            },
        );
        if (!response) {
            return;
        }

        try {
            const response = await deleteRoundAPI(player!.authToken, gameId, variant);
            setGame(response.data);
        } catch (e: any) {
            await alert(`Delete Round Error: ${e.message}`);
        }
    };

    const handleDeleteGame = async () => {
        const response = await confirmDialog("Are you sure you want to delete this game?", {
            okText: "Delete",
            okButtonStyle: "danger",
        });
        if (!response) {
            return;
        }

        try {
            await deleteGameAPI(player!.authToken, gameId, variant);
            await alert(`Game Deleted`);
            navigate("/");
        } catch (e: any) {
            await alert(`Delete Game Error: ${e.message}`);
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
            await submitGameAPI(player!.authToken, gameId, variant);
            await alert(`Game Submitted`);
            const tempGame = { ...game! };
            tempGame.status = "FINISHED";
            setGame(tempGame);
        } catch (e: any) {
            await alert(`Delete Game Error: ${e.message}`);
        }
    };

    const getOrderedPlayers = (): GamePlayer[] => {
        if (!game) {
            return [];
        }
        return game.players.slice();
    };
    const isRecording = (game: Game): boolean => {
        return (
            typeof player !== "undefined" &&
            game.status === "IN_PROGRESS" &&
            game.recordedById === player.id
        );
    };

    const getLegacyDisplayGame = (game: Game) => {
        if (variant === "jp") {
            return (
                <LegacyJapaneseGame
                    enableRecording={isRecording(game)}
                    players={getOrderedPlayers()}
                    game={game}
                    handleSubmitRound={handleSubmitRound}
                />
            );
        } else if (variant === "hk") {
            return (
                <LegacyHongKongGame
                    enableRecording={isRecording(game)}
                    players={getOrderedPlayers()}
                    game={game}
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
        <>
            <h1 className="mt-2">
                {getGameVariantString(variant, game.type)} Game
                {game.status === "IN_PROGRESS" && " - " + gameRoundString(game, variant)}
            </h1>
            {getLegacyDisplayGame(game)}
            {isRecording(game) && (
                <Container>
                    <Row>
                        <Col sm>
                            <Button
                                variant="contained"
                                color="error"
                                className="mb-2 w-100"
                                disabled={game.rounds.length == 0}
                                onClick={() => handleDeleteRound()}
                            >
                                Delete last Hand
                            </Button>
                        </Col>
                        <Col sm>
                            <Button
                                variant="contained"
                                color="error"
                                className="mb-2 w-100"
                                onClick={() => handleDeleteGame()}
                            >
                                Delete Game
                            </Button>
                        </Col>
                        <Col sm>
                            <Button
                                variant="contained"
                                color="success"
                                className="mb-2 w-100"
                                disabled={!isGameEnd(game, variant)}
                                onClick={() => handleSubmitGame()}
                            >
                                Submit Game
                            </Button>
                        </Col>
                    </Row>
                </Container>
            )}
        </>
    );
};

export type LegacyGameProps = {
    enableRecording: boolean;
    players: GamePlayer[];
    game: Game;
    handleSubmitRound: (roundRequest: any) => Promise<void>;
};

export default Game;
