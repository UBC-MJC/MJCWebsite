import {FC, useContext, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {AxiosError} from "axios";
import {getGameAPI} from "../api/GameAPI";
import {AuthContext} from "../common/AuthContext";
import EditGame from "./EditGame";
import {windComparison} from "../common/Utils";



const Game: FC = () => {
    const { id } = useParams()
    const { player } = useContext(AuthContext);
    const navigate = useNavigate();
    const gameId = Number(id)

    const [game, setGame] = useState<Game | undefined>(undefined)

    useEffect(() => {
        if (isNaN(gameId)) {
            return
        }

        getGameAPI(gameId).then((response) => {
            for (const player of response.data.players) {
                player.score = 25000
            }
            console.log("Game: ", response.data)
            setGame(response.data)
        }).catch((error: AxiosError) => {
            console.log("Error fetching game: ", error.response?.data)
            if (error.response?.status === 404) {
                navigate("/games/not-found")
                return
            }
        })
    }, [gameId, navigate])

    const getOrderedPlayers = () => {
        if (!game) {
            return []
        }

        const orderedPlayers = game.players.slice()

        if (typeof player !== "undefined" && game.recordedById === player.id) {
            const playerWind = game.players.find((testPlayer) => {
                return testPlayer.id === player.id
            }).trueWind

            orderedPlayers.sort((a, b) => {
                return windComparison(a.trueWind, b.trueWind, playerWind)
            })
        } else {
            orderedPlayers.sort((a, b) => {
                return windComparison(a.trueWind, b.trueWind)
            })
        }

        return orderedPlayers
    }

    const gameRoundString = (game: Game) => {
        const lastRound = game.rounds[game.rounds.length - 1]
        return `${lastRound.roundWind} ${lastRound.roundNumber} Bonus ${lastRound.bonus}`
    }

    if (isNaN(gameId)) {
        return (
            <div>
                <h1>Game Not Found</h1>
            </div>
        )
    }

    return (
        <>
            <h1>{game?.gameType} {game?.gameVariant} Game{game?.status === "IN_PROGRESS" && " - " + gameRoundString(game)}</h1>
            {game && game.status === "IN_PROGRESS" && game.recordedById === player?.id &&
                <EditGame gameVariant={game.gameVariant} players={getOrderedPlayers()} />
            }
        </>
    )
}

export default Game
