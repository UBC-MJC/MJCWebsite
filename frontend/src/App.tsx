import React, { useEffect, useState } from 'react'
import GameItem from './components/Game'
import { getGames, addGame } from './API'

import './App.css';

const App: React.FC = () => {
  const [games, setGames] = useState<IGame[]>([])

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = (): void => {
    getGames()
        .then(({ data: { games } }: IGame[] | any) => setGames(games))
        .catch((err: Error) => console.log(err))
  }

  const createGame = (): void => {
    addGame()
        .then(({ status, data }) => {
          if (status !== 201) {
            throw new Error("Error! Todo not saved")
          }
          setGames(data.games)
        })
        .catch(err => console.log(err))
  }

  return (
      <main className='App'>
        <h1>Games</h1>
        <button onClick={createGame}>Create Game</button>
        {games.map((game: IGame) => (
            <GameItem key={game.game_id} game={game}/>
        ))}
      </main>
  )
}

export default App;
