import { memo, useContext, useState } from "react";
import { AuthContext } from "@/common/AuthContext";
import { useSeasons } from "@/hooks/AdminHooks";
import { usePlayers } from "@/hooks/GameHooks";
import { useStatistics, usePlacementHistory } from "@/hooks/LeaderboardHooks";
import { Autocomplete, Container, Grid, Stack, TextField, Typography } from "@mui/material";
import { PlacementHistoryGraph } from "./PlacementHistoryGraph";
import type { GameVariant, Season } from "@/types";

const ALL_SEASONS: Season = {
    id: "all",
    name: "All Seasons",
    startDate: new Date("00000101"),
    endDate: new Date(),
};

const Statistics = ({ gameVariant }: { gameVariant: GameVariant }) => {
    const { player } = useContext(AuthContext);
    const [playerId, setPlayerId] = useState<string | null>(player?.id ?? null);
    const [season, setSeason] = useState<Season>(ALL_SEASONS);
    const { isSuccess: seasonsSuccess, data: seasons } = useSeasons();
    const { isSuccess: playersSuccess, data: players } = usePlayers(gameVariant, "CASUAL");

    const allSeasons = [ALL_SEASONS, ...(seasons ?? [])];

    if (!seasonsSuccess || !playersSuccess || !seasons || !players) {
        return <>Loading ...</>;
    }

    const selectedPlayer = playerId ? (players.find((p) => p.playerId === playerId) ?? null) : null;

    return (
        <Container>
            <Stack spacing={2}>
                <Typography variant="h1">Game Statistics</Typography>

                <Grid container spacing={2}>
                    <Grid size={6}>
                        <Autocomplete
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            getOptionLabel={(option) => option.name}
                            options={allSeasons}
                            blurOnSelect
                            disableClearable
                            onChange={(_e, value) => setSeason(value)}
                            sx={{ flex: 1 }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Season"
                                    placeholder="Select a season"
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={6}>
                        <Autocomplete
                            isOptionEqualToValue={(option, value) =>
                                option.playerId === value.playerId
                            }
                            getOptionLabel={(option) => option.username}
                            options={players}
                            value={selectedPlayer}
                            blurOnSelect
                            onChange={(_e, value) => {
                                setPlayerId(value?.playerId ?? null);
                            }}
                            sx={{ flex: 1 }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Player"
                                    placeholder="Select a player"
                                />
                            )}
                        />
                    </Grid>
                </Grid>
                <DisplayStatistics
                    playerId={playerId === null ? undefined : playerId}
                    gameVariant={gameVariant}
                    season={season}
                />
            </Stack>
        </Container>
    );
};

export const DisplayStatistics = memo(
    ({
        playerId,
        gameVariant,
        season,
    }: {
        playerId: string | undefined;
        gameVariant: GameVariant;
        season: Season;
    }) => {
        const { isSuccess, data: stats } = useStatistics(playerId, gameVariant, season);
        const { isSuccess: historySuccess, data: placementHistory } = usePlacementHistory(
            playerId,
            gameVariant,
            season,
        );

        if (!isSuccess) {
            return "";
        }

        return (
            <Stack spacing={3}>
                    <Grid container spacing={2}>
                        <Grid size={6}>
                            Deal-in %: {divideWithDefault(100 * stats.dealInCount, stats.totalRounds).toFixed(2)}%
                        </Grid>
                        <Grid size={6}>
                            Avg Deal-in size: {divideWithDefault(stats.dealInPoint, stats.dealInCount).toFixed(0)}
                        </Grid>
                        <Grid size={6}>
                            Win %: {divideWithDefault(100 * stats.winCount, stats.totalRounds).toFixed(2)}%
                        </Grid>
                        <Grid size={6}>
                            Avg Agari size: {divideWithDefault(stats.winPoint, stats.winCount).toFixed(0)}
                        </Grid>
                        <Grid size={6}>
                            Riichi Rate: {divideWithDefault(100 * stats.riichiCount, stats.totalRounds).toFixed(2)}%
                        </Grid>
                        <Grid size={6}>
                            Riichi Win Rate: {divideWithDefault(100 * stats.winRiichiCount, stats.riichiCount).toFixed(2)}%
                        </Grid>
                        <Grid size={6}>
                            Riichi Deal-in Rate: {divideWithDefault(100 * stats.dealInRiichiCount, stats.riichiCount).toFixed(2)}%
                        </Grid>
                    </Grid>

                {historySuccess && placementHistory && placementHistory.length > 0 && (
                    <PlacementHistoryGraph data={placementHistory} />
                )}
            </Stack>
        );
    },
);
DisplayStatistics.displayName = "DisplayStatistics";

function divideWithDefault(numerator: number, denominator: number, defaultValue = 0) {
    const result = numerator / denominator;
    if (isNaN(result)) {
        return defaultValue;
    }
    return result;
}

export default Statistics;
