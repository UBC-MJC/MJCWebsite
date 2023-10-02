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
import LegacyDisplayGame from "./legacy/LegacyDisplayGame";
import { getGameTypeString, validateGameVariant, windComparison } from "../common/Utils";
import validateRound from "./validateRound";
import alert from "../common/AlertDialog";
import confirmDialog from "../common/ConfirmationDialog";

const Game: FC = () => {
    const { id, variant } = useParams();
    const { player } = useContext(AuthContext);
    const navigate = useNavigate();
    const gameId = Number(id);

    const [game, setGame] = useState<Game | undefined>(undefined);

    if (isNaN(gameId) || !validateGameVariant(variant)) {
        navigate("/games/not-found");
        return <></>;
    }

    useEffect(() => {
        getGameAPI(gameId, variant)
            .then((response) => {
                console.log("Game: ");
                console.log(response.data);

                setGame(response.data);
            })
            .catch((error: AxiosError) => {
                console.log("Error fetching game: ", error.response?.data);
                if (error.response?.status === 404) {
                    navigate("/games/not-found");
                    return;
                }
            });
    }, [gameId, navigate]);

    const handleSubmitRound = async (
        roundValue: RoundValue,
        pointsValue: any,
        needPoints: boolean,
    ) => {
        try {
            validateRound(roundValue, pointsValue, game!.gameVariant, needPoints);
        } catch (e: any) {
            await alert(`Error: ${e.message}`);
            return;
        }

        addRoundAPI(player!.authToken, gameId, variant, {
            roundValue,
            pointsValue,
        })
            .then((response) => {
                console.log(response.data);
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

        const orderedPlayers = game.players.slice();

        if (typeof player !== "undefined" && game.recordedById === player.id) {
            const playerWind = game.players.find((testPlayer) => {
                return testPlayer.id === player.id;
            }).trueWind;

            orderedPlayers.sort((a, b) => {
                return windComparison(a.trueWind, b.trueWind, playerWind);
            });
        } else {
            orderedPlayers.sort((a, b) => {
                return windComparison(a.trueWind, b.trueWind);
            });
        }

        return orderedPlayers as GamePlayer[];
    };

    const legacyToggle = (): boolean => {
        if (typeof player === "undefined") {
            return true;
        }

        return player.legacyDisplayGame;
    };

    const isRecording = (game: Game): boolean => {
        return (
            typeof player !== "undefined" &&
            game.status === "IN_PROGRESS" &&
            game.recordedById === player.id
        );
    };

    const gameRoundString = (game: Game) => {
        const lastRound = game.currentRound;
        return `${lastRound.roundWind} ${lastRound.roundNumber} Bonus ${lastRound.bonus}`;
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
                {game.gameType} {getGameTypeString(variant)} Game
                {game.status === "IN_PROGRESS" && " - " + gameRoundString(game)}
            </h1>
            {legacyToggle() ? (
                <LegacyDisplayGame
                    gameVariant={variant}
                    enableRecording={isRecording(game)}
                    game={game}
                    players={getOrderedPlayers()}
                    handleSubmitRound={handleSubmitRound}
                    handleDeleteRound={handleDeleteRound}
                    handleSubmitGame={handleSubmitGame}
                    handleDeleteGame={handleDeleteGame}
                />
            ) : (
                <LegacyDisplayGame
                    gameVariant={variant}
                    enableRecording={isRecording(game)}
                    game={game}
                    players={getOrderedPlayers()}
                    handleSubmitRound={handleSubmitRound}
                    handleDeleteRound={handleDeleteRound}
                    handleSubmitGame={handleSubmitGame}
                    handleDeleteGame={handleDeleteGame}
                />
            )}
        </>
    );
};

export default Game;
