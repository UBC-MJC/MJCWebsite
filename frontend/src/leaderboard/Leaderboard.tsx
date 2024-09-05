import React, { FC, useState } from "react";
import { getGameVariantString } from "../common/Utils";
import { Container, Table } from "react-bootstrap";
import { useSeasons } from "../hooks/AdminHooks";
import { usePlayerLeaderboard } from "../hooks/LeaderboardHooks";
import { mapSeasonToOption } from "../game/common/constants";
import { Autocomplete, TextField } from "@mui/material";

const Leaderboard: FC<GameCreationProp> = ({ gameVariant, gameType }) => {
    const [season, setSeason] = useState<Season | undefined>();

    const { isSuccess: seasonsSuccess, data: seasons } = useSeasons(setSeason);

    if (!seasonsSuccess) {
        return <h5 className="my-3">Loading...</h5>;
    }
    const seasonsOptions = mapSeasonToOption(seasons);
    return (
        <Container className="my-4" fluid="lg">
            <h1>{getGameVariantString(gameVariant)} Leaderboard</h1>

            <div className="text-start d-flex justify-content-center align-items-end">
                <h5 className="mx-2">Season: </h5>
                <Autocomplete
                    isOptionEqualToValue={(option, value) => option.label === value.label}
                    options={seasonsOptions}
                    sx={{ width: "200px" }}
                    onChange={(event, value) => setSeason(value!.value)}
                    renderInput={(params) => (
                        <TextField {...params} placeholder="Default: this season" />
                    )}
                />
            </div>

            {season === undefined ? (
                <h5>No season selected</h5>
            ) : (
                <LeaderboardDisplay season={season} gameType={gameType} gameVariant={gameVariant} />
            )}
        </Container>
    );
};

const LeaderboardDisplay: FC<{ gameVariant: GameVariant; gameType: GameType; season: Season }> = ({
    gameVariant,
    gameType,
    season,
}) => {
    const { isSuccess, data: leaderboard } = usePlayerLeaderboard(gameVariant, gameType, season);
    if (!isSuccess) {
        return <h5>Loading ...</h5>;
    }
    return (
        <>
            <h5>
                {season.name} season ends {new Date(season.endDate).toDateString()}
            </h5>
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
        </>
    );
};
export default Leaderboard;
