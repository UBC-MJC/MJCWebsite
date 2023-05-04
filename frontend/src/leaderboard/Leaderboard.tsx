import {FC, useEffect, useState} from "react";
import {AxiosError} from "axios";
import {getPlayerLeaderboard} from "../api/LeaderboardAPI";
import {getGameTypeString} from "../common/Utils";
import {Container, Table} from "react-bootstrap";

const Leaderboard: FC<GameTypeProp> = ({gameVariant}) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardType[]>([])

    useEffect(() => {
        getPlayerLeaderboard(gameVariant).then((response) => {
            setLeaderboard(response.data.players)
        }).catch((error: AxiosError) => {
            console.log("Error fetching leaderboard: ", error.response?.data)
        })
    }, [gameVariant])

    return (
        <Container fluid="lg">
            <h1 className="my-4">{getGameTypeString(gameVariant)} Leaderboard</h1>
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
