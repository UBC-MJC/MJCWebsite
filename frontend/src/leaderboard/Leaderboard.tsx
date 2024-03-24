import React, { FC, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { getPlayerLeaderboard } from "../api/LeaderboardAPI";
import { getGameTypeString } from "../common/Utils";
import { Container, Table } from "react-bootstrap";
import Select from "react-select";
import { getSeasonsAPI } from "../api/AdminAPI";

const Leaderboard: FC<GameTypeProp> = ({ gameVariant }) => {
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [selectSeason, setSelectSeason] = useState<Season | undefined>(undefined);
    const [leaderboard, setLeaderboard] = useState<LeaderboardType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof selectSeason !== "undefined") {
            getPlayerLeaderboard(gameVariant, selectSeason.id)
                .then((response) => {
                    const playerElos: LeaderboardType[] = response.data.players.sort((a, b) => {
                        return Number(b.elo) - Number(a.elo);
                    });
                    const oneDecimalEloLeaderboard: LeaderboardType[] = playerElos.map((player) => {
                        const elo = Number(player.elo);

                        return {
                            ...player,
                            elo: elo.toFixed(1),
                        };
                    });
                    setLeaderboard(oneDecimalEloLeaderboard);
                })
                .catch((error: AxiosError) => {
                    console.log("Error fetching leaderboard: ", error.response?.data);
                });
        }
    }, [gameVariant, selectSeason]);

    useEffect(() => {
        getSeasonsAPI()
            .then((response) => {
                const allSeasons = response.data.pastSeasons;
                if (response.data.currentSeason) {
                    allSeasons.unshift(response.data.currentSeason);
                    setSelectSeason(response.data.currentSeason);
                }

                setSeasons(allSeasons);
                setLoading(false);
            })
            .catch((error: AxiosError) => {
                console.error("Error fetching seasons: ", error.response?.data);
            });
    }, []);

    const getSelectOptions = (seasons: Season[]): OptionsType[] => {
        return seasons.map((season, index) => {
            return { label: season.name, value: index.toString() };
        });
    };

    if (loading) {
        return <h5 className="my-3">Loading...</h5>;
    }

    return (
        <Container fluid="lg">
            <div className="my-4">
                <h1>{getGameTypeString(gameVariant)} Leaderboard</h1>

                <div className="text-start d-flex justify-content-center align-items-end">
                    <h5 className="mx-2">Season: </h5>
                    <Select
                        options={getSelectOptions(seasons)}
                        isSearchable
                        placeholder="Choose a season"
                        value={
                            selectSeason
                                ? {
                                      label: selectSeason.name,
                                      value: seasons.indexOf(selectSeason).toString(),
                                  }
                                : null
                        }
                        getOptionValue={(selectOptions) => selectOptions.label}
                        onChange={(e) => setSelectSeason(seasons[Number(e!.value)])}
                    />
                </div>

                {selectSeason ? (
                    <h5>
                        {selectSeason.name} season ends{" "}
                        {new Date(selectSeason.endDate).toDateString()}
                    </h5>
                ) : (
                    <h5>No season selected</h5>
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
