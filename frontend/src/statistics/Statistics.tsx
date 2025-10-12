import React, { FC, useContext, useState } from "react";
import { AuthContext } from "@/common/AuthContext";
import { useSeasons } from "@/hooks/AdminHooks";
import { usePlayers } from "@/hooks/GameHooks";
import { mapPlayerNameToOption, mapSeasonToOption } from "@/game/common/constants";
import { useStatistics } from "@/hooks/LeaderboardHooks";
import { Autocomplete, Container, Grid, Stack, TextField, Typography } from "@mui/material";
import type { GameVariant, Season } from "@/types";

const Statistics: FC<{ gameVariant: GameVariant }> = ({ gameVariant }) => {
    const [playerId, setPlayerId] = useState<string | undefined>(
        useContext(AuthContext).player?.id,
    );
    const [season, setSeason] = useState<Season | undefined>();
    const seasonsResult = useSeasons(setSeason);
    const playersResult = usePlayers(gameVariant, "CASUAL");

    if (!seasonsResult.isSuccess || !playersResult.isSuccess) {
        return <>Loading ...</>;
    }
    const seasonsOptions = mapSeasonToOption(seasonsResult.data);
    const playersOptions = mapPlayerNameToOption(playersResult.data);
    return (
        <Container sx={{ py: 4 }}>
            <Stack spacing={1}>
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    sx={{ mb: 4, fontWeight: 600 }}
                >
                    Round Statistics
                </Typography>

                <Stack spacing={1} direction="row">
                    <Stack spacing={1} direction="column" width="50%">
                        <Typography variant="h6" component="h2">
                            Season
                        </Typography>
                        <Autocomplete
                            isOptionEqualToValue={(option, value) => option.label === value.label}
                            options={seasonsOptions}
                            onChange={(event, value) => setSeason(value!.value)}
                            renderInput={(params) => (
                                <TextField {...params} placeholder="Default: this season" />
                            )}
                        />
                    </Stack>
                    <Stack spacing={1} direction="column" width="50%">
                        <Typography variant="h6" component="h2">
                            Players
                        </Typography>
                        <Autocomplete
                            isOptionEqualToValue={(option, value) => option.label === value.label}
                            options={playersOptions}
                            onChange={(event, value) => setPlayerId(value!.value)}
                            renderInput={(params) => (
                                <TextField {...params} placeholder="Default: your stats" />
                            )}
                        />
                    </Stack>
                </Stack>
                <DisplayStatistics playerId={playerId} gameVariant={gameVariant} season={season} />
            </Stack>
        </Container>
    );
};

export const DisplayStatistics = React.memo<{
    playerId: string | undefined;
    gameVariant: GameVariant;
    season: Season | undefined;
}>(({ playerId, gameVariant, season }) => {
    const { isSuccess, data: stats } = useStatistics(playerId, gameVariant, season);
    if (!isSuccess) {
        return "";
    }
    return (
        <>
            <Grid container spacing={2}>
                <Grid size={6}>
                    Deal-in %:{" "}
                    {divideWithDefault(100 * stats.dealInCount, stats.totalRounds).toFixed(2)}%
                </Grid>
                <Grid size={6}>
                    Avg Deal-in size:{" "}
                    {divideWithDefault(stats.dealInPoint, stats.dealInCount).toFixed(0)}
                </Grid>
                <Grid size={6}>
                    Win %: {divideWithDefault(100 * stats.winCount, stats.totalRounds).toFixed(2)}%
                </Grid>
                <Grid size={6}>
                    Avg Agari size: {divideWithDefault(stats.winPoint, stats.winCount).toFixed(0)}
                </Grid>
                <Grid size={6}>
                    Riichi Rate:{" "}
                    {divideWithDefault(100 * stats.riichiCount, stats.totalRounds).toFixed(2)}%
                </Grid>
                <Grid size={6}>
                    Riichi Win Rate:{" "}
                    {divideWithDefault(100 * stats.winRiichiCount, stats.riichiCount).toFixed(2)}%
                </Grid>
                <Grid size={6}>
                    Riichi Deal-in Rate:{" "}
                    {divideWithDefault(100 * stats.dealInRiichiCount, stats.riichiCount).toFixed(2)}
                    %
                </Grid>
            </Grid>
        </>
    );
});
function divideWithDefault(numerator: number, denominator: number, defaultValue = 0) {
    const result = numerator / denominator;
    if (isNaN(result)) {
        return defaultValue;
    }
    return result;
}

export default Statistics;
