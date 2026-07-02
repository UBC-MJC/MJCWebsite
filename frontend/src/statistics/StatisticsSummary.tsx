import { memo } from "react";
import { Box, Grid, Stack, Typography } from "@mui/material";
import StatCard from "@/common/atoms/StatCard";

export interface PlayerStatistics {
    totalRounds: number;
    dealInCount: number;
    dealInPoint: number;
    winCount: number;
    winPoint: number;
    riichiCount: number;
    winRiichiCount: number;
    dealInRiichiCount: number;
}

interface StatisticsSummaryProps {
    stats: PlayerStatistics;
    /** Riichi-specific rows only apply to the Japanese variant. */
    showRiichi?: boolean;
}

function divideWithDefault(numerator: number, denominator: number, defaultValue = 0) {
    const result = numerator / denominator;
    return isNaN(result) ? defaultValue : result;
}

interface StatItem {
    label: string;
    value: string;
    sub?: string;
}

/**
 * A labeled group of correlated stats. Cards keep a fixed column count at every
 * breakpoint (no reflow) — the card text scales down instead. The surrounding
 * titled panel visually ties the row together.
 */
const StatRow = ({ title, items }: { title: string; items: StatItem[] }) => (
    <Box
        sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "action.hover",
            p: { xs: 1, sm: 1.5 },
        }}
    >
        <Typography
            variant="overline"
            sx={{ display: "block", color: "text.secondary", fontWeight: 700, lineHeight: 1.6, mb: 0.5 }}
        >
            {title}
        </Typography>
        <Grid container spacing={{ xs: 0.75, sm: 1.5 }} columns={items.length}>
            {items.map((s) => (
                <Grid key={s.label} size={1} sx={{ minWidth: 0 }}>
                    <StatCard label={s.label} value={s.value} sub={s.sub} />
                </Grid>
            ))}
        </Grid>
    </Box>
);

/**
 * Condenses the summary metrics into two scalable rows: general performance
 * (deal-in rate, win rate, avg deal-in, avg agari) and — for the Japanese
 * variant — all riichi-related stats. Each row reflows independently.
 */
const StatisticsSummary = memo(({ stats, showRiichi = true }: StatisticsSummaryProps) => {
    const pct = (num: number, denom: number) =>
        `${divideWithDefault(100 * num, denom).toFixed(2)}%`;
    const avg = (num: number, denom: number) => divideWithDefault(num, denom).toFixed(0);

    const generalStats: StatItem[] = [
        { label: "Deal-in Rate", value: pct(stats.dealInCount, stats.totalRounds), sub: "of total rounds" },
        { label: "Win Rate", value: pct(stats.winCount, stats.totalRounds), sub: "of total rounds" },
        { label: "Avg Deal-in", value: avg(stats.dealInPoint, stats.dealInCount), sub: "points per deal-in" },
        { label: "Avg Agari", value: avg(stats.winPoint, stats.winCount), sub: "points per win" },
    ];

    const riichiStats: StatItem[] = [
        { label: "Riichi Rate", value: pct(stats.riichiCount, stats.totalRounds), sub: "of total rounds" },
        { label: "Riichi Win %", value: pct(stats.winRiichiCount, stats.riichiCount), sub: "of riichi declared" },
        { label: "Riichi Deal-in %", value: pct(stats.dealInRiichiCount, stats.riichiCount), sub: "of riichi declared" },
    ];

    return (
        <Stack spacing={1.5}>
            <StatRow title="General" items={generalStats} />
            {showRiichi && <StatRow title="Riichi" items={riichiStats} />}
        </Stack>
    );
});
StatisticsSummary.displayName = "StatisticsSummary";

export default StatisticsSummary;
