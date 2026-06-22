import { memo, useMemo, useState } from "react";
import {
    Box,
    Chip,
    Divider,
    Paper,
    Slider,
    Stack,
    Typography,
    Grid,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { palette, placement as placementColors } from "@/theme/tokens";
import PlacementDistributionBar from "./PlacementDistributionBar";

interface PlacementHistoryEntry {
    gameId: number;
    createdAt: string;
    placement: number;
    score: number;
    scores: number[];
}

interface PlacementHistoryGraphProps {
    data: PlacementHistoryEntry[];
}

const ORDINALS: Record<1 | 2 | 3 | 4, string> = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th" };
const PLACEMENTS: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4];

// Default (and maximum) number of recent games shown. The slider lets the user
// dial down from here; capped at 30 to keep backend query load light.
const DEFAULT_WINDOW = 30;

/** Compact, colored card for a single finishing position. */
const PlacementStatCard = ({
    place,
    count,
    percent,
}: {
    place: 1 | 2 | 3 | 4;
    count: number;
    percent: string;
}) => (
    <Paper
        variant="outlined"
        sx={{
            p: { xs: 0.75, sm: 1.5 },
            textAlign: "center",
            minWidth: 0,
            overflowWrap: "anywhere",
            borderTop: `3px solid ${placementColors[place]}`,
        }}
    >
        <Typography
            sx={{
                color: placementColors[place],
                fontWeight: 800,
                fontVariantNumeric: "tabular-nums",
                fontSize: "clamp(1.2rem, 5vw, 2rem)",
                lineHeight: 1.1,
            }}
        >
            {count}
        </Typography>
        <Typography
            color="text.secondary"
            sx={{ fontWeight: 600, fontSize: "clamp(0.72rem, 2vw, 0.875rem)" }}
        >
            {ORDINALS[place]}
        </Typography>
        <Typography
            color="text.disabled"
            sx={{ display: "block", fontSize: "clamp(0.62rem, 1.6vw, 0.75rem)" }}
        >
            {percent}%
        </Typography>
    </Paper>
);

export const PlacementHistoryGraph = memo(({ data }: PlacementHistoryGraphProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [windowSize, setWindowSize] = useState<number>(DEFAULT_WINDOW);

    // Slice the most-recent `windowSize` games (data is oldest → newest).
    const visible = useMemo(() => data.slice(-windowSize), [data, windowSize]);

    const { counts, total, avgPlacement } = useMemo(() => {
        const placementStats: Record<1 | 2 | 3 | 4, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
        visible.forEach((entry) => {
            const p = entry.placement as 1 | 2 | 3 | 4;
            if (p >= 1 && p <= 4) placementStats[p]++;
        });
        const totalGames = visible.length;
        const weighted = placementStats[1] + placementStats[2] * 2 + placementStats[3] * 3 + placementStats[4] * 4;
        return {
            counts: placementStats,
            total: totalGames,
            avgPlacement: totalGames > 0 ? (weighted / totalGames).toFixed(2) : "—",
        };
    }, [visible]);

    const chartData = useMemo(
        () => visible.map((entry, index) => ({ game: index + 1, placement: entry.placement })),
        [visible],
    );

    // Widen the scroll area so dense windows stay legible on small screens.
    const chartWidth = Math.max(360, visible.length * 38 + 90);

    // Slider can never exceed the available games (or the 30-game cap).
    const maxGames = Math.min(DEFAULT_WINDOW, data.length);
    const sliderValue = Math.min(windowSize, maxGames);

    if (data.length === 0) {
        return (
            <Paper sx={{ p: 2 }}>
                <Typography color="text.secondary">No placement history available</Typography>
            </Paper>
        );
    }

    const pct = (value: number) => (total > 0 ? ((value / total) * 100).toFixed(1) : "0.0");

    return (
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Games-window slider — dynamically choose how many recent games to show. */}
            <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, sm: 2.5 }}>
                <Chip
                    label={`Last ${total} Game${total === 1 ? "" : "s"}`}
                    sx={{
                        flexShrink: 0,
                        height: "auto",
                        py: 0.75,
                        fontWeight: 800,
                        fontSize: "1.1rem",
                        color: "rgba(0,0,0,0.85)",
                        border: "none",
                        // Matches the slider track's white → pastel-red gradient.
                        background: `linear-gradient(90deg, #FFFFFF, ${palette.primary.light})`,
                        "& .MuiChip-label": { fontWeight: 800, fontSize: "1.1rem" },
                    }}
                />
                <Slider
                    value={sliderValue}
                    min={1}
                    max={maxGames}
                    step={1}
                    onChange={(_e, value) => setWindowSize(value as number)}
                    valueLabelDisplay="auto"
                    aria-label="Number of games to display"
                    disabled={maxGames <= 1}
                    sx={{
                        flexGrow: 1,
                        mx: { xs: 1.5, sm: 3 },
                        "& .MuiSlider-rail": { height: 10, borderRadius: 5 },
                        // Filled track uses the same white → pastel-red sweep as gradientTitle.
                        "& .MuiSlider-track": {
                            height: 10,
                            borderRadius: 5,
                            border: "none",
                            background: `linear-gradient(90deg, #FFFFFF, ${palette.primary.light})`,
                        },
                        "& .MuiSlider-thumb": {
                            width: 22,
                            height: 22,
                            backgroundColor: palette.primary.light,
                        },
                    }}
                />
            </Stack>

            {/* Average placement headline. */}
            <Stack
                direction="row"
                alignItems="baseline"
                spacing={2}
                sx={{ mt: { xs: 2, sm: 2.5 } }}
            >
                <Typography
                    sx={{
                        color: "text.secondary",
                        fontWeight: 600,
                        lineHeight: 1.2,
                        fontSize: "clamp(1.1rem, 3.2vw, 1.5rem)",
                    }}
                >
                    AVERAGE PLACEMENT:
                </Typography>
                <Typography
                    sx={{
                        fontWeight: 800,
                        fontVariantNumeric: "tabular-nums",
                        lineHeight: 1,
                        fontSize: "clamp(1.7rem, 5.5vw, 2.75rem)",
                    }}
                >
                    {avgPlacement}
                </Typography>
            </Stack>

            <Divider sx={{ my: { xs: 2, sm: 2.5 } }} />

            {/* Placement statistics — one row, ordered 1st → 4th. */}
            <Grid container spacing={{ xs: 0.75, sm: 2 }} sx={{ mb: 2.5 }}>
                {PLACEMENTS.map((place) => (
                    <Grid key={place} size={3} sx={{ minWidth: 0 }}>
                        <PlacementStatCard place={place} count={counts[place]} percent={pct(counts[place])} />
                    </Grid>
                ))}
            </Grid>

            {/* Distribution bar — visual share of each position. */}
            <PlacementDistributionBar counts={counts} total={total} />

            <Divider sx={{ my: { xs: 2, sm: 3 } }} />


            <Box
                display="flex"
                justifyContent="safe center"
                width="100%"
                role="img"
                aria-label={`Placement over the last ${total} games. ${PLACEMENTS.map(
                    (p) => `${ORDINALS[p]}: ${counts[p]} (${pct(counts[p])}%)`,
                ).join(", ")}. Average placement ${avgPlacement}.`}
                sx={{ overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch" }}
            >
                <Box sx={{ minWidth: chartWidth }}>
                    <LineChart
                        dataset={chartData}
                        colors={[palette.primary.main]}
                        xAxis={[{ dataKey: "game", label: "Game (oldest → most recent)", tickMinStep: 1 }]}
                        yAxis={[
                            {
                                reverse: true,
                                min: 1,
                                max: 4,
                                // Always render the full 1–4 placement scale.
                                tickInterval: [1, 2, 3, 4],
                                label: "Placement",
                            },
                        ]}
                        series={[{ dataKey: "placement", showMark: true, curve: "linear" }]}
                        grid={{ horizontal: true }}
                        slots={{
                            mark: (props) => {
                                const { x, y, dataIndex } = props;
                                const place = chartData[dataIndex]?.placement as 1 | 2 | 3 | 4;
                                const color = placementColors[place] ?? palette.primary.main;
                                return (
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={8}
                                        fill={color}
                                        stroke={theme.palette.background.paper}
                                        strokeWidth={2}
                                    />
                                );
                            },
                        }}
                        slotProps={{ legend: { hidden: true } }}
                        height={isMobile ? 320 : 440}
                        width={chartWidth}
                        sx={{
                            pointerEvents: "none",
                            [`& .MuiLineElement-root`]: { strokeWidth: 3 },
                        }}
                    />
                </Box>
            </Box>
        </Paper>
    );
});

PlacementHistoryGraph.displayName = "PlacementHistoryGraph";
