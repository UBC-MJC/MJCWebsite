import { memo, useContext, useState } from "react";
import { AuthContext } from "@/common/AuthContext";
import { useSeasons } from "@/hooks/AdminHooks";
import { usePlayers } from "@/hooks/GameHooks";
import { mapPlayerNameToOption, mapSeasonToOption } from "@/game/common/constants";
import { useStatistics } from "@/hooks/LeaderboardHooks";
import {
    Autocomplete,
    Card,
    CardContent,
    Container,
    Grid,
    Paper,
    Skeleton,
    Stack,
    TextField,
    Typography,
    useTheme,
} from "@mui/material";
import type { GameVariant, Season } from "@/types";

const Statistics = ({ gameVariant }: { gameVariant: GameVariant }) => {
    const [playerId, setPlayerId] = useState<string | undefined>(
        useContext(AuthContext).player?.id,
    );
    const [season, setSeason] = useState<Season | undefined>();
    const seasonsResult = useSeasons(setSeason);
    const playersResult = usePlayers(gameVariant, "CASUAL");

    if (!seasonsResult.isSuccess || !playersResult.isSuccess) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Stack spacing={3}>
                    <Skeleton variant="text" width={250} height={50} />
                    <Stack direction="row" spacing={2}>
                        <Skeleton variant="rounded" width="50%" height={80} />
                        <Skeleton variant="rounded" width="50%" height={80} />
                    </Stack>
                    <Grid container spacing={2}>
                        {[...Array(6)].map((_, index) => (
                            <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                                <Skeleton variant="rounded" height={120} />
                            </Grid>
                        ))}
                    </Grid>
                </Stack>
            </Container>
        );
    }

    const seasonsOptions = mapSeasonToOption(seasonsResult.data);
    const playersOptions = mapPlayerNameToOption(playersResult.data);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack spacing={4}>
                <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                        fontWeight: 600,
                    }}
                >
                    Round Statistics
                </Typography>

                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        background: (theme) =>
                            theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(0, 0, 0, 0.02)",
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Stack spacing={1.5}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight: 600,
                                        color: "text.secondary",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                    }}
                                >
                                    Season
                                </Typography>
                                <Autocomplete
                                    isOptionEqualToValue={(option, value) =>
                                        option.label === value.label
                                    }
                                    options={seasonsOptions}
                                    onChange={(event, value) => setSeason(value?.value)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Default: this season"
                                            size="small"
                                        />
                                    )}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Stack spacing={1.5}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight: 600,
                                        color: "text.secondary",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                    }}
                                >
                                    Player
                                </Typography>
                                <Autocomplete
                                    isOptionEqualToValue={(option, value) =>
                                        option.label === value.label
                                    }
                                    options={playersOptions}
                                    onChange={(event, value) => setPlayerId(value?.value)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Default: your stats"
                                            size="small"
                                        />
                                    )}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                        },
                                    }}
                                />
                            </Stack>
                        </Grid>
                    </Grid>
                </Paper>

                <DisplayStatistics playerId={playerId} gameVariant={gameVariant} season={season} />
            </Stack>
        </Container>
    );
};

const StatCard = ({
    label,
    value,
    color,
}: {
    label: string;
    value: string;
    color?: string;
}) => {
    const theme = useTheme();
    return (
        <Card
            elevation={0}
            sx={{
                height: "100%",
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                    transform: { xs: "none", sm: "translateY(-2px)" },
                    boxShadow: { xs: 0, sm: theme.shadows[2] },
                },
            }}
        >
            <CardContent sx={{ p: { xs: 2, sm: 2.5 }, "&:last-child": { pb: { xs: 2, sm: 2.5 } } }}>
                <Typography
                    variant="caption"
                    sx={{
                        color: "text.secondary",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        display: "block",
                        mb: 0.5,
                    }}
                >
                    {label}
                </Typography>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        color: color || "primary.main",
                        fontSize: { xs: "1.5rem", sm: "1.75rem" },
                    }}
                >
                    {value}
                </Typography>
            </CardContent>
        </Card>
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
        const theme = useTheme();
        const { isSuccess, data: stats } = useStatistics(playerId, gameVariant, season);

        if (!isSuccess) {
            return (
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                    {[...Array(7)].map((_, i) => (
                        <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
                        </Grid>
                    ))}
                </Grid>
            );
        }

        const statisticsData = [
            {
                label: "Win Rate",
                value: `${divideWithDefault(100 * stats.winCount, stats.totalRounds).toFixed(2)}%`,
                color: theme.palette.success.main,
            },
            {
                label: "Avg Agari Size",
                value: divideWithDefault(stats.winPoint, stats.winCount).toFixed(0),
                color: theme.palette.success.light,
            },
            {
                label: "Deal-in Rate",
                value: `${divideWithDefault(100 * stats.dealInCount, stats.totalRounds).toFixed(2)}%`,
                color: theme.palette.error.main,
            },
            {
                label: "Avg Deal-in Size",
                value: divideWithDefault(stats.dealInPoint, stats.dealInCount).toFixed(0),
                color: theme.palette.error.light,
            },
            {
                label: "Riichi Rate",
                value: `${divideWithDefault(100 * stats.riichiCount, stats.totalRounds).toFixed(2)}%`,
                color: theme.palette.info.main,
            },
            {
                label: "Riichi Win Rate",
                value: `${divideWithDefault(100 * stats.winRiichiCount, stats.riichiCount).toFixed(2)}%`,
                color: theme.palette.info.light,
            },
            {
                label: "Deal-in after Riichi",
                value: `${divideWithDefault(100 * stats.dealInRiichiCount, stats.riichiCount).toFixed(2)}%`,
                color: theme.palette.warning.main,
            },
        ];

        return (
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                {statisticsData.map((stat, i) => (
                    <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                        <StatCard {...stat} />
                    </Grid>
                ))}
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
