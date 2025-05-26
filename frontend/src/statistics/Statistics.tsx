import React, { FC, useContext, useState } from "react";
import { AuthContext } from "../common/AuthContext";
import { useSeasons } from "../hooks/AdminHooks";
import { usePlayers } from "../hooks/GameHooks";
import { mapPlayerNameToOption, mapSeasonToOption } from "../game/common/constants";
import { useStatistics } from "../hooks/LeaderboardHooks";
import { Autocomplete, TextField, Stack, Container, Typography } from "@mui/material";

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
        <div>
            <Typography variant="h4" gutterBottom>
                Round Statistics
            </Typography>
            <Container>
                <Stack direction="row" spacing={4}>
                    <Stack direction="column" spacing={2} flex={1}>
                        <Typography variant="h6">Season</Typography>
                        <Autocomplete
                            isOptionEqualToValue={(option, value) => option.label === value.label}
                            options={seasonsOptions}
                            onChange={(event, value) => setSeason(value!.value)}
                            renderInput={(params) => (
                                <TextField {...params} placeholder="Default: this season" />
                            )}
                        />
                    </Stack>
                    <Stack direction="column" spacing={2} flex={1}>
                        <Typography variant="h6">Players</Typography>
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
            </Container>
        </div>
    );
};

const DisplayStatistics: FC<{
    playerId: string | undefined;
    gameVariant: GameVariant;
    season: Season | undefined;
}> = ({ playerId, gameVariant, season }) => {
    const { isSuccess, data: stats } = useStatistics(playerId, gameVariant, season);
    if (!isSuccess) {
        return <>Loading ...</>;
    }
    return (
        <Stack direction="column" spacing={2} mt={4}>
            <Stack direction="row" spacing={2}>
                <Typography flex={1}>Deal-in %</Typography>
                <Typography flex={1}>
                    {divideWithDefault(100 * stats.dealInCount, stats.totalRounds).toFixed(2)}%
                </Typography>
                <Typography flex={1}>Avg Deal-in size</Typography>
                <Typography flex={1}>
                    {divideWithDefault(stats.dealInPoint, stats.dealInCount).toFixed(0)}
                </Typography>
            </Stack>
            <Stack direction="row" spacing={2}>
                <Typography flex={1}>Win %</Typography>
                <Typography flex={1}>
                    {divideWithDefault(100 * stats.winCount, stats.totalRounds).toFixed(2)}%
                </Typography>
                <Typography flex={1}>Avg Agari size</Typography>
                <Typography flex={1}>
                    {divideWithDefault(stats.winPoint, stats.winCount).toFixed()}
                </Typography>
            </Stack>
        </Stack>
    );
};
function divideWithDefault(numerator: number, denominator: number, defaultValue = 0) {
    const result = numerator / denominator;
    if (isNaN(result)) {
        return defaultValue;
    }
    return result;
}

export default Statistics;
