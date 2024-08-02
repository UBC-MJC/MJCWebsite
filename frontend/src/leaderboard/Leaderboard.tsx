import React, { FC, useState } from "react";
import { getGameVariantString } from "../common/Utils";
import { Container, Table } from "react-bootstrap";
import { useSeasons } from "../hooks/AdminHooks";
import { usePlayerLeaderboard } from "../hooks/LeaderboardHooks";
import { mapSeasonToOption } from "../game/common/constants";
import { Autocomplete, TextField } from "@mui/material";

const Leaderboard: FC<GameVariantProp> = ({ gameVariant }) => {
    const [season, setSeason] = useState<Season | undefined>();

    const { isSuccess: seasonsSuccess, data: seasons } = useSeasons(setSeason);

    const { isSuccess, data: leaderboard } = usePlayerLeaderboard(gameVariant, season);

    if (!isSuccess || !seasonsSuccess) {
        return <h5 className="my-3">Loading...</h5>;
    }
    const seasonsOptions = mapSeasonToOption(seasons);
    return (
        <Container fluid="lg">
            <div className="my-4">
                <h1>{getGameVariantString(gameVariant)} Leaderboard</h1>

                <div className="text-start d-flex justify-content-center align-items-end">
                    <h5 className="mx-2">Season: </h5>
                    <Autocomplete
                        options={seasonsOptions}
                        defaultValue={season === undefined ? null : seasonsOptions[0]}
                        onChange={(event, value) => setSeason(value!.value)}
                        renderInput={(params) => (
                            <TextField {...params} placeholder="Choose a season" />
                        )}
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
