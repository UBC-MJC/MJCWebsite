import {FC, useEffect, useState} from "react";
import {AxiosError} from "axios";
import {getCurrentSeason, getPlayerLeaderboard} from "../api/LeaderboardAPI";
import {getGameTypeString} from "../common/Utils";
import {Container, Table} from "react-bootstrap";

const Leaderboard: FC<GameTypeProp> = ({gameVariant}) => {
    const [currentSeason, setCurrentSeason] = useState<Season | undefined>(undefined)
    const [leaderboard, setLeaderboard] = useState<LeaderboardType[]>([])

    useEffect(() => {
        getPlayerLeaderboard(gameVariant).then((response) => {
            setLeaderboard(response.data.players)
        }).catch((error: AxiosError) => {
            console.log("Error fetching leaderboard: ", error.response?.data)
        })
    }, [gameVariant])

    useEffect(() => {
        getCurrentSeason().then((response) => {
            setCurrentSeason(response.data)
        }).catch((error: AxiosError) => {
            console.log("Error fetching current season: ", error.response?.data)
        })
    }, [])

    return (
        <Container fluid="lg">
            <div className="my-4">
                <h1>{getGameTypeString(gameVariant)} Leaderboard</h1>
                {currentSeason && <h3>{currentSeason.name} season ends {new Date(currentSeason.endDate).toDateString()}</h3>}
            </div>
            <Table striped responsive hover className="text-nowrap">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Player</th>
                        <th>ELO</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard.map((player, index) => {
                        return (
                            <tr key={player.username}>
                                <td>{index + 1}</td>
                                <td>{player.username}</td>
                                <td>{player.elo}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
        </Container>
    )
}

export default Leaderboard
