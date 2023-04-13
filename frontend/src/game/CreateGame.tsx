import React, {useEffect, useState} from 'react'
import GameItem from './GameItem'
import {addGame, getGames} from '../api/GameAPI'

const CreateGame: React.FC = () => {
    const [games, setGames] = useState<IGame[]>([])

    useEffect(() => {
        fetchGames()
    }, [])

    const fetchGames = (): void => {
        getGames()
            .then(({data: {games}}: IGame[] | any) => setGames(games))
            .catch((err: Error) => console.log(err))
    }

    const createGame = (): void => {
        addGame()
            .then(({status, data}) => {
                if (status !== 201) {
                    throw new Error("Error! Game not saved")
                }
                setGames(data.games)
            })
            .catch(err => console.log(err))
    }

    return (
        <div>
            <h1>Games</h1>
            <button onClick={createGame}>Create Game</button>
            {games.map((game: IGame) => (
                <GameItem key={game.game_id} game={game}/>
            ))}
        </div>
    )
}

export default CreateGame;
