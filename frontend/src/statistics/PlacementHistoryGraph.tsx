import { memo, useMemo } from "react";
import { Box, Paper, Stack, Typography, Grid } from "@mui/material";
import "./PlacementHistoryGraph.scss";

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

export const PlacementHistoryGraph = memo(({ data }: PlacementHistoryGraphProps) => {
    const { graphData, stats, cumulativeScores } = useMemo(() => {
        if (!data || data.length === 0) {
            return {
                graphData: [],
                stats: { 1: 0, 2: 0, 3: 0, 4: 0 },
                cumulativeScores: [],
            };
        }

        // Calculate placement statistics
        const placementStats = { 1: 0, 2: 0, 3: 0, 4: 0 };
        let cumulativeScore = 0;
        const cumScores = [];

        data.forEach((entry) => {
            placementStats[entry.placement as 1 | 2 | 3 | 4]++;
            cumulativeScore += entry.score;
            cumScores.push(cumulativeScore);
        });

        return {
            graphData: data,
            stats: placementStats,
            cumulativeScores: cumScores,
        };
    }, [data]);

    if (graphData.length === 0) {
        return (
            <Paper sx={{ p: 2 }}>
                <Typography>No placement history available</Typography>
            </Paper>
        );
    }

    // Calculate SVG dimensions and scaling
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    let width: number;
    const height = isMobile ? 200 : 300;
    const padding = isMobile ? 30 : 40;
    const rightPadding = isMobile ? 30 : 40;
    
    if (isMobile) {
        // On mobile: prioritize scrolling with comfortable spacing
        const pointSpacing = 25;
        width = Math.max(300, graphData.length * pointSpacing + 150);
    } else {
        // On desktop: use tight spacing to fit all nodes without scrolling
        const desiredSpacing = 30; // Increased spacing for better readability
        const graphWidth = graphData.length * desiredSpacing;
        width = graphWidth + padding + rightPadding;
    }
    
    const graphWidth = width - padding - rightPadding;
    const graphHeight = height - 2 * padding;

    // Find min and max scores for scaling
    const allScores = cumulativeScores.concat(graphData.map((d) => d.score));
    const maxScore = Math.max(...allScores);
    const minScore = Math.min(...allScores, 0);
    const scoreRange = maxScore - minScore || 1;

    // Create SVG points for placement line
    const placementPoints = graphData
        .map((entry, index) => {
            const x = padding + (index / (graphData.length - 1 || 1)) * graphWidth;
            const y =
                padding +
                ((entry.placement - 1) / 3) * graphHeight;
            return `${x},${y}`;
        })
        .join(" ");

    // Create SVG points for cumulative score line
    const scorePoints = cumulativeScores
        .map((score, index) => {
            const x = padding + (index / (graphData.length - 1 || 1)) * graphWidth;
            const normalizedScore = (score - minScore) / scoreRange;
            const y = padding + graphHeight - normalizedScore * graphHeight;
            return `${x},${y}`;
        })
        .join(" ");

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
                        justifyContent: isMobile ? "flex-start" : "center",
                        width: "100%",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    <svg width={width} height={height} style={{ flex: "0 0 auto", display: "block" }} className="placement-graph">
                        {/* Grid lines */}
                        <line
                            x1={padding}
                            y1={padding}
                            x2={width - rightPadding}
                            y2={padding}
                            stroke="#ddd"
                            strokeWidth="1"
                        />
                        <line
                            x1={padding}
                            y1={padding + graphHeight / 3}
                            x2={width - rightPadding}
                            y2={padding + graphHeight / 3}
                            stroke="#ddd"
                            strokeWidth="1"
                            strokeDasharray="5,5"
                        />
                        <line
                            x1={padding}
                            y1={padding + (2 * graphHeight) / 3}
                            x2={width - rightPadding}
                            y2={padding + (2 * graphHeight) / 3}
                            stroke="#ddd"
                            strokeWidth="1"
                            strokeDasharray="5,5"
                        />
                        <line
                            x1={padding}
                            y1={padding + graphHeight}
                            x2={width - rightPadding}
                            y2={padding + graphHeight}
                            stroke="#333"
                            strokeWidth="2"
                        />
                        <line
                            x1={padding}
                            y1={padding}
                            x2={padding}
                            y2={padding + graphHeight}
                            stroke="#333"
                            strokeWidth="2"
                        />

                        {/* Placement line */}
                        <polyline
                            points={placementPoints}
                            fill="none"
                            stroke="#2196F3"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Data points */}
                        {graphData.map((entry, index) => {
                            const x = padding + (index / (graphData.length - 1 || 1)) * graphWidth;
                            const y =
                                padding +
                                ((entry.placement - 1) / 3) * graphHeight;
                            const color =
                                PLACEMENT_COLORS[entry.placement as 1 | 2 | 3 | 4];
                            return (
                                <circle
                                    key={`point-${index}`}
                                    cx={x}
                                    cy={y}
                                    r="5"
                                    fill={color}
                                    stroke="#333"
                                    strokeWidth="1"
                                />
                            );
                        })}

                        {/* Y-axis labels for placement */}
                        <text
                            x={padding - 10}
                            y={padding + 5}
                            textAnchor="end"
                            fontSize="12"
                            fill="#666"
                        >
                            1st
                        </text>
                        <text
                            x={padding - 10}
                            y={padding + graphHeight / 3 + 5}
                            textAnchor="end"
                            fontSize="12"
                            fill="#666"
                        >
                            2nd
                        </text>
                        <text
                            x={padding - 10}
                            y={padding + (2 * graphHeight) / 3 + 5}
                            textAnchor="end"
                            fontSize="12"
                            fill="#666"
                        >
                            3rd
                        </text>
                        <text
                            x={padding - 10}
                            y={padding + graphHeight + 5}
                            textAnchor="end"
                            fontSize="12"
                            fill="#666"
                        >
                            4th
                        </text>

                        {/* X-axis labels for game chronology */}
                        <text
                            x={padding}
                            y={padding + graphHeight + 20}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#666"
                        >
                            Oldest
                        </text>
                        <text
                            x={width - rightPadding}
                            y={padding + graphHeight + 20}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#666"
                        >
                            Newest
                        </text>
                    </svg>
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
