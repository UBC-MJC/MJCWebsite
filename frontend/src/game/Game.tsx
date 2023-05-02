import {FC, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {AxiosError} from "axios";
import {getGameAPI} from "../api/GameAPI";

const Game: FC = () => {
    const { id } = useParams()
    const navigate = useNavigate();
    const gameId = Number(id)

    const [game, setGame] = useState<Game | undefined>(undefined)

    useEffect(() => {
        if (isNaN(gameId)) {
            return
        }

        getGameAPI(gameId).then((response) => {
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

    if (isNaN(gameId)) {
        return (
            <div>
                <h1>Game Not Found</h1>
            </div>
        )
    }

    return (
        <>
            <h1>ID: {id}</h1>
            <div>GameType: {game?.gameType}</div>
            <div>GameVariant: {game?.gameVariant}</div>
            <div>GameStatus: {game?.status}</div>
            <h3>Players</h3>
            {game?.players.map((player) => {
                return (
                    <div key={player.playerId}>{player.wind} | {player.player.username}</div>
                )
            })}
            <h3>Rounds</h3>
            {game?.rounds.map((round) => {
                return (
                    <div key={round.id}>{round.roundWind} | {round.roundNumber} | {round.roundCount}</div>
                )
            })}
        </>
    )
}

export default Game
