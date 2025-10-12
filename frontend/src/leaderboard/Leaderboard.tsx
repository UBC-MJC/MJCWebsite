import React, { FC, useState } from "react";
import { getGameVariantString } from "@/common/Utils";
import { useSeasons } from "@/hooks/AdminHooks";
import { usePlayerLeaderboard } from "@/hooks/LeaderboardHooks";
import { mapSeasonToOption } from "@/game/common/constants";
import LoadingFallback from "@/common/LoadingFallback";
import { GridColDef, DataGrid } from "@mui/x-data-grid";
import type { GameCreationProp, Season, GameVariant, GameType, LeaderboardType } from "@/types";
import {
    Autocomplete,
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { DisplayStatistics } from "@/statistics/Statistics";

const Leaderboard: FC<GameCreationProp> = ({ gameVariant, gameType }) => {
    const [season, setSeason] = useState<Season | undefined>();
    const { isSuccess: seasonsSuccess, data: seasons } = useSeasons(setSeason);

    if (!seasonsSuccess) {
        return <LoadingFallback minHeight="50vh" message="Loading seasons..." />;
    }
    const seasonsOptions = mapSeasonToOption(seasons);
    return (
        <Box sx={{ py: 4 }}>
            <Stack spacing={1} margin="auto" width={"80%"} maxWidth="800px">
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{ mb: 4, fontWeight: 600 }}
                >
                    {getGameVariantString(gameVariant, gameType)} Leaderboard
                </Typography>

                <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                    Season:
                </Typography>
                <Autocomplete
                    isOptionEqualToValue={(option, value) => option.label === value.label}
                    options={seasonsOptions}
                    onChange={(event, value) => setSeason(value!.value)}
                    renderInput={(params) => (
                        <TextField {...params} placeholder="Default: this season" />
                    )}
                />

                {season === undefined ? (
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        No season selected
                    </Typography>
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
        field: "index",
        headerName: "#",
        type: "number",
        flex: 0.5,
    },
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
const LeaderboardDisplay = React.memo<{ gameVariant: GameVariant; gameType: GameType; season: Season }>(({
    gameVariant,
    gameType,
    season,
}) => {
    const { isSuccess, data: leaderboard } = usePlayerLeaderboard(gameVariant, gameType, season);
    const [player, setPlayer] = useState<LeaderboardType | undefined>(undefined);
    if (!isSuccess) {
        return <LoadingFallback minHeight="30vh" message="Loading leaderboard..." />;
    }
    //
    return (
        <>
            <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                {season.name} season ends {new Date(season.endDate).toDateString()}
            </Typography>
            <Box sx={{ height: 600, width: "100%" }}>
                <DataGrid<(typeof leaderboard)[0]>
                    rows={leaderboard}
                    columns={columns}
                    initialState={{
                        columns: {
                            columnVisibilityModel: {
                                chomboCount: false,
                            },
                        },
                    }}
                    onRowDoubleClick={(params) => setPlayer(params.row)}
                />
            </Box>
            <Dialog open={player !== undefined} onClose={() => setPlayer(undefined)}>
                <DialogTitle>Statistics for {player?.username}</DialogTitle>
                <DialogContent>
                    <DisplayStatistics
                        playerId={player?.id}
                        gameVariant={gameVariant}
                        season={season}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
});
export default Leaderboard;
