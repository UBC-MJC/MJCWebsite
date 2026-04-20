import { memo, useMemo } from "react";
import { Box, Paper, Stack, Typography, Grid } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";

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

const PLACEMENT_COLORS = {
    1: "#FFD700", // Gold
    2: "#C0C0C0", // Silver
    3: "#CD7F32", // Bronze
    4: "#404040", // Dark Gray/Black
};

interface MarkProps {
    x: number;
    y: number;
    dataIndex: number;
    shape: string;
    color: string;
}

export const PlacementHistoryGraph = memo(({ data }: PlacementHistoryGraphProps) => {
    const { graphData, stats } = useMemo(() => {
        if (!data || data.length === 0) {
            return {
                graphData: [],
                stats: { 1: 0, 2: 0, 3: 0, 4: 0 },
            };
        }

        // Calculate placement statistics
        const placementStats = { 1: 0, 2: 0, 3: 0, 4: 0 };

        data.forEach((entry) => {
            placementStats[entry.placement as 1 | 2 | 3 | 4]++;
        });

        return {
            graphData: data,
            stats: placementStats,
        };
    }, [data]);

    if (graphData.length === 0) {
        return (
            <Paper sx={{ p: 2 }}>
                <Typography>No placement history available</Typography>
            </Paper>
        );
    }

    // Calculate dimensions
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    const chartWidth = Math.max(400, graphData.length * 30 + 100); 

    const chartData = graphData.map((entry, index) => ({ game: index - graphData.length, placement: entry.placement }));

    const CustomMark = (props: MarkProps) => {
        const { x, y, dataIndex } = props;
        const placement = chartData[dataIndex]?.placement;
        const color = placement ? PLACEMENT_COLORS[placement as keyof typeof PLACEMENT_COLORS] : '#000';
        return <circle cx={x} cy={y} r={5} fill={color} stroke="#333" strokeWidth={1} />;
    };

    // Calculate placement statistics
    const totalGames = graphData.length;
    const placementPercentages = {
        1: ((stats[1] / totalGames) * 100).toFixed(1),
        2: ((stats[2] / totalGames) * 100).toFixed(1),
        3: ((stats[3] / totalGames) * 100).toFixed(1),
        4: ((stats[4] / totalGames) * 100).toFixed(1),
    };

    // Calculate average placement
    const avgPlacement = (
        (stats[1] * 1 + stats[2] * 2 + stats[3] * 3 + stats[4] * 4) /
        totalGames
    ).toFixed(2);

    return (
        <Stack spacing={3}>
            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Placement History (Last 30 Games)
                </Typography>
                <Box
                    sx={{
                        overflowX: "auto",
                        overflowY: "hidden",
                        display: "flex",
                        justifyContent: "safe center",
                        width: "100%",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    <div style={{ minWidth: chartWidth }}>
                        <LineChart
                            dataset={chartData}
                            xAxis={[{ dataKey: 'game', label: 'Game Number' }]}
                            yAxis={[{ reverse: true, min: 1, max: 4, label: 'Placement' }]}
                            series={[{ dataKey: 'placement', showMark: true }]}
                            slots={{ mark: CustomMark }}
                            slotProps={{
                                legend: { hidden: true },
                            }}
                            height={isMobile ? 250 : 300}
                            width={chartWidth}
                            sx={{ pointerEvents: 'none' }}
                        />
                    </div>
                </Box>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: "block" }}>
                    Colored dots represent each game placement (Gold = 1st, Silver = 2nd, Bronze = 3rd, Gray = 4th)
                </Typography>
            </Paper>

            {/* Statistics Cards */}
            <Grid container spacing={2}>
                <Grid size={6}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="h4" sx={{ color: PLACEMENT_COLORS[1], fontWeight: "bold" }}>
                            {stats[1]}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            1st Place
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            {placementPercentages[1]}%
                        </Typography>
                    </Paper>
                </Grid>

                <Grid size={6}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="h4" sx={{ color: PLACEMENT_COLORS[2], fontWeight: "bold" }}>
                            {stats[2]}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            2nd Place
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            {placementPercentages[2]}%
                        </Typography>
                    </Paper>
                </Grid>

                <Grid size={6}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="h4" sx={{ color: PLACEMENT_COLORS[3], fontWeight: "bold" }}>
                            {stats[3]}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            3rd Place
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            {placementPercentages[3]}%
                        </Typography>
                    </Paper>
                </Grid>

                <Grid size={6}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="h4" sx={{ color: PLACEMENT_COLORS[4], fontWeight: "bold" }}>
                            {stats[4]}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            4th Place
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            {placementPercentages[4]}%
                        </Typography>
                    </Paper>
                </Grid>

                <Grid size={12}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            {avgPlacement}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Average Placement
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Stack>
    );
});

PlacementHistoryGraph.displayName = "PlacementHistoryGraph";
