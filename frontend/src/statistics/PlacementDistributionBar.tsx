import { memo } from "react";
import { Box, Stack, Tooltip, Typography } from "@mui/material";
import { placement as placementColors, onAccent, timing } from "@/theme/tokens";
import { ORDINALS, PLACEMENTS } from "./placementConstants";

interface PlacementDistributionBarProps {
    /** Count of games finished in each position. */
    counts: Record<1 | 2 | 3 | 4, number>;
    total: number;
}

/**
 * Horizontal stacked bar visualising how a player's finishes are distributed
 * across the selected window of games. Segments are proportional to each
 * position's share and reuse the shared placement color tokens.
 */
const PlacementDistributionBar = memo(({ counts, total }: PlacementDistributionBarProps) => {
    return (
        <Box>
            <Box
                role="img"
                aria-label={`Placement distribution over ${total} games: ${PLACEMENTS.map(
                    (p) => `${ORDINALS[p]} ${counts[p]}`,
                ).join(", ")}`}
                sx={{
                    display: "flex",
                    width: "100%",
                    height: 28,
                    borderRadius: 1.5,
                    overflow: "hidden",
                    bgcolor: "action.hover",
                }}
            >
                {total > 0 &&
                    PLACEMENTS.map((p) => {
                        const value = counts[p];
                        if (value === 0) return null;
                        const percent = (value / total) * 100;
                        return (
                            <Tooltip
                                key={p}
                                title={`${ORDINALS[p]} — ${value} game${value === 1 ? "" : "s"} (${percent.toFixed(1)}%)`}
                                arrow
                            >
                                <Box
                                    sx={{
                                        width: `${percent}%`,
                                        bgcolor: placementColors[p],
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: onAccent.muted,
                                        fontSize: "0.7rem",
                                        fontWeight: 700,
                                        transition: `width 0.3s ${timing.ease}`,
                                        minWidth: 0,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {percent >= 8 ? `${Math.round(percent)}%` : ""}
                                </Box>
                            </Tooltip>
                        );
                    })}
            </Box>

            {/* Legend */}
            <Stack
                direction="row"
                spacing={2}
                useFlexGap
                flexWrap="wrap"
                sx={{ mt: 1.5, justifyContent: "center" }}
            >
                {PLACEMENTS.map((p) => (
                    <Stack key={p} direction="row" alignItems="center" spacing={0.75}>
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: "3px",
                                bgcolor: placementColors[p],
                                flexShrink: 0,
                            }}
                        />
                        <Typography variant="caption" color="text.secondary">
                            {ORDINALS[p]} ({counts[p]})
                        </Typography>
                    </Stack>
                ))}
            </Stack>
        </Box>
    );
});
PlacementDistributionBar.displayName = "PlacementDistributionBar";

export default PlacementDistributionBar;
