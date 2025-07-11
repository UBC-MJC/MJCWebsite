import React, { FC, useState } from "react";
import { getGameVariantString } from "../common/Utils";
import { useSeasons } from "../hooks/AdminHooks";
import { usePlayerLeaderboard } from "../hooks/LeaderboardHooks";
import { mapSeasonToOption } from "../game/common/constants";
import { GridColDef, DataGrid } from "@mui/x-data-grid";
import { Autocomplete, Box, Stack, TextField } from "@mui/material";

const Leaderboard: FC<GameCreationProp> = ({ gameVariant, gameType }) => {
    const [season, setSeason] = useState<Season | undefined>();

    const { isSuccess: seasonsSuccess, data: seasons } = useSeasons(setSeason);

    if (!seasonsSuccess) {
        return <h5 className="my-3">Loading...</h5>;
    }
    const seasonsOptions = mapSeasonToOption(seasons);
    return (
        <Box>
            <Stack spacing={1} margin="auto" width={"80%"} maxWidth="800px">
                <h1>{getGameVariantString(gameVariant, gameType)} Leaderboard</h1>
                <h5>Season: </h5>
                <Autocomplete
                    isOptionEqualToValue={(option, value) => option.label === value.label}
                    options={seasonsOptions}
                    onChange={(event, value) => setSeason(value!.value)}
                    renderInput={(params) => (
                        <TextField {...params} placeholder="Default: this season" />
                    )}
                />

                {season === undefined ? (
                    <h5>No season selected</h5>
                ) : (
                    <LeaderboardDisplay
                        season={season}
                        gameType={gameType}
                        gameVariant={gameVariant}
                    />
                )}
            </Stack>
        </Box>
    );
};

const columns: GridColDef[] = [
    {
        field: "username",
        headerName: "Player",
        flex: 1.5,
    },
    {
        field: "displayElo",
        headerName: "Elo",
        type: "number",
        flex: 1,
    },
    {
        field: "gameCount",
        headerName: "Games",
        type: "number",
        flex: 1,
    },
    {
        field: "chomboCount",
        headerName: "Chombos",
        type: "number",
        flex: 0.5,
    },
];
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
            <Box>
                <DataGrid
                    rows={leaderboard}
                    columns={columns}
                    initialState={{
                        columns: {
                            columnVisibilityModel: {
                                chomboCount: false,
                            },
                        },
                    }}
                />
            </Box>
        </>
    );
};
export default Leaderboard;
