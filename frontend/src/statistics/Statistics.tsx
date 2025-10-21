import { memo, useContext, useState } from "react";
import { AuthContext } from "@/common/AuthContext";
import { useSeasons } from "@/hooks/AdminHooks";
import { usePlayers } from "@/hooks/GameHooks";
import { mapPlayerNameToOption, mapSeasonToOption } from "@/game/common/constants";
import { useStatistics } from "@/hooks/LeaderboardHooks";
import {
    Autocomplete,
    Box,
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

interface StatCardProps {
    label: string;
    value: string;
    color?: string;
}

const StatCard = ({ label, value, color }: StatCardProps) => {
    const theme = useTheme();

    return (
        <Card
            elevation={0}
            sx={{
                height: "100%",
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: theme.shadows[4],
                    borderColor: color || theme.palette.primary.main,
                },
            }}
        >
            <CardContent
                sx={{
                    p: 3,
                    "&:last-child": { pb: 3 },
                }}
            >
                <Stack spacing={1.5}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "text.secondary",
                            fontWeight: 500,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            fontSize: "0.75rem",
                        }}
                    >
                        {label}
                    </Typography>
                    <Typography
                        variant="h4"
                        component="div"
                        sx={{
                            fontWeight: 700,
                            color: color || "primary.main",
                            fontSize: { xs: "1.75rem", sm: "2rem" },
                        }}
                    >
                        {value}
                    </Typography>
                </Stack>
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
                <Grid container spacing={2}>
                    {[...Array(7)].map((_, index) => (
                        <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 2 }} />
                        </Grid>
                    ))}
                </Grid>
            );
        }

        const dealInRate = divideWithDefault(100 * stats.dealInCount, stats.totalRounds);
        const winRate = divideWithDefault(100 * stats.winCount, stats.totalRounds);
        const riichiRate = divideWithDefault(100 * stats.riichiCount, stats.totalRounds);
        const riichiWinRate = divideWithDefault(100 * stats.winRiichiCount, stats.riichiCount);
        const riichiDealInRate = divideWithDefault(
            100 * stats.dealInRiichiCount,
            stats.riichiCount,
        );

        const statisticsData = [
            {
                label: "Win Rate",
                value: `${winRate.toFixed(2)}%`,
                color: theme.palette.success.main,
            },
            {
                label: "Average Agari Size",
                value: divideWithDefault(stats.winPoint, stats.winCount).toFixed(0),
                color: theme.palette.success.light,
            },
            {
                label: "Deal-in Rate",
                value: `${dealInRate.toFixed(2)}%`,
                color: theme.palette.error.main,
            },
            {
                label: "Average Deal-in Size",
                value: divideWithDefault(stats.dealInPoint, stats.dealInCount).toFixed(0),
                color: theme.palette.error.light,
            },
            {
                label: "Riichi Rate",
                value: `${riichiRate.toFixed(2)}%`,
                color: theme.palette.info.main,
            },
            {
                label: "Riichi Win Rate",
                value: `${riichiWinRate.toFixed(2)}%`,
                color: theme.palette.info.light,
            },
            {
                label: "Riichi Deal-in Rate",
                value: `${riichiDealInRate.toFixed(2)}%`,
                color: theme.palette.warning.main,
            },
        ];

        return (
            <Box>
                <Grid container spacing={2}>
                    {statisticsData.map((stat, index) => (
                        <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                            <StatCard label={stat.label} value={stat.value} color={stat.color} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
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
