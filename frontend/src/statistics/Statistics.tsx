import { memo, useContext, useState } from "react";
import { AuthContext } from "@/common/AuthContext";
import { useSeasons } from "@/hooks/AdminHooks";
import { usePlayers } from "@/hooks/GameHooks";
import { useStatistics, usePlacementHistory } from "@/hooks/LeaderboardHooks";
import { Autocomplete, Container, Grid, Stack, TextField, Typography } from "@mui/material";
import { PlacementHistoryGraph } from "./PlacementHistoryGraph";
import StatisticsSummary from "./StatisticsSummary";
import LoadingFallback from "@/common/LoadingFallback";
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
        return <LoadingFallback message="Loading statistics…" />;
    }

    const selectedPlayer = playerId ? (players.find((p) => p.playerId === playerId) ?? null) : null;

    return (
        <Container sx={{ px: { xs: 1.5, sm: 2, md: 3 }, overflowX: "hidden" }}>
            <Stack spacing={{ xs: 2.5, sm: 3 }}>
                <Typography variant="h1">Game Statistics</Typography>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Autocomplete
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            getOptionLabel={(option) => option.name}
                            options={allSeasons}
                            blurOnSelect
                            disableClearable
                            onChange={(_e, value) => setSeason(value)}
                            renderInput={(params) => (
                                <TextField {...params} label="Season" placeholder="Select a season" />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Autocomplete
                            isOptionEqualToValue={(option, value) =>
                                option.playerId === value.playerId
                            }
                            getOptionLabel={(option) => option.username}
                            options={players}
                            value={selectedPlayer}
                            blurOnSelect
                            onChange={(_e, value) => setPlayerId(value?.playerId ?? null)}
                            renderInput={(params) => (
                                <TextField {...params} label="Player" placeholder="Select a player" />
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
            return <LoadingFallback minHeight="20vh" message="Loading stats…" />;
        }

        return (
            <Stack spacing={3}>
                <StatisticsSummary stats={stats} showRiichi={gameVariant === "jp"} />

                {historySuccess && placementHistory && placementHistory.length > 0 && (
                    <PlacementHistoryGraph data={placementHistory} />
                )}
            </Stack>
        );
    },
);
DisplayStatistics.displayName = "DisplayStatistics";

export default Statistics;
