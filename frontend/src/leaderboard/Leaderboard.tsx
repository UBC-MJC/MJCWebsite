import React, { FC, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { getPlayerLeaderboard } from "../api/LeaderboardAPI";
import { getGameVariantString } from "../common/Utils";
import { Container, Table } from "react-bootstrap";
import Select from "react-select";
import { getSeasonsAPI } from "../api/AdminAPI";
import { mapLeaderboardToOneDecimal, mapSeasonToOption } from "../game/common/constants";

const Leaderboard: FC<GameVariantProp> = ({ gameVariant }) => {
    const [seasons, setSeasons] = useState<OptionsType<Season>[]>([]);
    const [season, setSeason] = useState<Season | undefined>();
    const [leaderboard, setLeaderboard] = useState<LeaderboardType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function init() {
            const seasonsResponse = await getSeasonsAPI();
            const allSeasons = seasonsResponse.data;
            if (allSeasons.length > 0 && new Date(allSeasons[0].endDate) > new Date()) {
                setSeason(allSeasons[0]);
            }
            setSeasons(mapSeasonToOption(allSeasons));
            setLoading(false);
        }
        init().catch((error: AxiosError) => {
            console.error("Error fetching seasons: ", error.response?.data);
        });
    }, []);

    useEffect(() => {
        if (season !== undefined) {
            getPlayerLeaderboard(gameVariant, season.id)
                .then((response) => {
                    setLeaderboard(mapLeaderboardToOneDecimal(response.data.players));
                })
                .catch((error: AxiosError) => {
                    console.log("Error fetching leaderboard: ", error.response?.data);
                });
        }
    }, [gameVariant, season]);

    if (loading) {
        return <h5 className="my-3">Loading...</h5>;
    }

    return (
        <Container fluid="lg">
            <div className="my-4">
                <h1>{getGameVariantString(gameVariant)} Leaderboard</h1>

                <div className="text-start d-flex justify-content-center align-items-end">
                    <h5 className="mx-2">Season: </h5>
                    <Select
                        options={seasons}
                        isSearchable
                        placeholder="Choose a season"
                        defaultValue={season === undefined ? null : seasons[0]}
                        getOptionValue={(selectOptions) => selectOptions.label}
                        onChange={(e) => setSeason(e!.value)}
                    />
                </div>

                {season ? (
                    <h5>
                        {season.name} season ends {new Date(season.endDate).toDateString()}
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
