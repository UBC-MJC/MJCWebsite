import { FC, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { getCurrentSeason, getPlayerLeaderboard } from "../api/LeaderboardAPI";
import { getGameTypeString } from "../common/Utils";
import { Container, Table } from "react-bootstrap";

const Leaderboard: FC<GameTypeProp> = ({ gameVariant }) => {
    const [currentSeason, setCurrentSeason] = useState<Season | undefined>(undefined);
    const [leaderboard, setLeaderboard] = useState<LeaderboardType[]>([]);
    const [noSeasonsMessage, setNoSeasonsMessage] = useState<string>("");

    useEffect(() => {
        getPlayerLeaderboard(gameVariant)
            .then((response) => {
                const oneDecimalEloLeaderboard: LeaderboardType[] = response.data.players.map(
                    (player) => {
                        const elo = Number(player.elo);

                        return {
                            ...player,
                            elo: elo.toFixed(1),
                        };
                    },
                );
                setLeaderboard(oneDecimalEloLeaderboard);
            })
            .catch((error: AxiosError) => {
                console.log("Error fetching leaderboard: ", error.response?.data);
            });
    }, [gameVariant]);

    useEffect(() => {
        getCurrentSeason()
            .then((response) => {
                setCurrentSeason(response.data);
            })
            .catch((error: AxiosError) => {
                setNoSeasonsMessage("No seasons currently active.");
            });
    }, []);

    if (currentSeason === undefined) {
        return <h5>{noSeasonsMessage}</h5>;
    }

    return (
        <Container fluid="lg">
            <div className="my-4">
                <h1>{getGameTypeString(gameVariant)} Leaderboard</h1>
                {currentSeason && (
                    <h5>
                        {currentSeason.name} season ends{" "}
                        {new Date(currentSeason.endDate).toDateString()}
                    </h5>
                )}
            </div>
            <Table striped responsive hover className="text-nowrap">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Player</th>
                        <th>ELO</th>
                        <th>Games</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard.map((player, index) => {
                        return (
                            <tr key={player.username}>
                                <td>{index + 1}</td>
                                <td>{player.username}</td>
                                <td>{player.elo}</td>
                                <td>{player.gameCount}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </Container>
    );
};

export default Leaderboard;
