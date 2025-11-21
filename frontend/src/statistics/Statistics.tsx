import { memo, useContext, useEffect, useState } from "react";
import { AuthContext } from "@/common/AuthContext";
import { useSeasons } from "@/hooks/AdminHooks";
import { usePlayers } from "@/hooks/GameHooks";
import { useStatistics } from "@/hooks/LeaderboardHooks";
import { Autocomplete, Container, Grid, Stack, TextField, Typography } from "@mui/material";
import type { GameVariant, Season } from "@/types";

const Statistics = ({ gameVariant }: { gameVariant: GameVariant }) => {
    const { player } = useContext(AuthContext);
    const [playerId, setPlayerId] = useState<string | null>(player?.id ?? null);
    const [season, setSeason] = useState<Season | null>(null);
    const { isSuccess: seasonsSuccess, data: seasons } = useSeasons();
    const { isSuccess: playersSuccess, data: players } = usePlayers(gameVariant, "CASUAL");

    useEffect(() => {
        // Set the first season as the current season
        if (seasonsSuccess && seasons && seasons.length > 0) {
            setSeason(seasons[0]);
        }
    }, [seasonsSuccess, seasons]);

    if (!seasonsSuccess || !playersSuccess || !seasons || !players) {
        return <>Loading ...</>;
    }

    const selectedPlayer = playerId ? (players.find((p) => p.playerId === playerId) ?? null) : null;

    return (
        <Container>
            <Stack>
                <Typography variant="h1">Game Statistics</Typography>

                <Stack direction={{ xs: "column", sm: "row" }}>
                    <Autocomplete
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        getOptionLabel={(option) => option.name}
                        options={seasons}
                        value={season}
                        blurOnSelect
                        onChange={(_e, value) => setSeason(value)}
                        sx={{ flex: 1 }}
                        renderInput={(params) => (
                            <TextField {...params} label="Season" placeholder="Select a season" />
                        )}
                    />
                    <Autocomplete
                        isOptionEqualToValue={(option, value) => option.playerId === value.playerId}
                        getOptionLabel={(option) => option.username}
                        options={players}
                        value={selectedPlayer}
                        blurOnSelect
                        onChange={(_e, value) => {
                            setPlayerId(value?.playerId ?? null);
                        }}
                        sx={{ flex: 1 }}
                        renderInput={(params) => (
                            <TextField {...params} label="Player" placeholder="Select a player" />
                        )}
                    />
                </Stack>
                <DisplayStatistics
                    playerId={playerId === null ? undefined : playerId}
                    gameVariant={gameVariant}
                    season={season === null ? undefined : season}
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
        season: Season | undefined;
    }) => {
        const { isSuccess, data: stats } = useStatistics(playerId, gameVariant, season);
        if (!isSuccess) {
            return "";
        }
        return (
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
