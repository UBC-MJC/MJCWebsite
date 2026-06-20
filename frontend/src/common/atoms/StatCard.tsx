import { Box, Card, CardContent, Typography } from "@mui/material";

interface StatCardProps {
    label: string;
    value: string;
    /** Optional small note below the value. */
    sub?: string;
    /** Optional decorative colour applied to the value text. */
    valueColor?: string;
}

/**
 * Atom — displays a single labelled metric inside a lightweight card.
 * Scales from 1 to N stats by dropping into any Grid container.
 */
const StatCard = ({ label, value, sub, valueColor }: StatCardProps) => (
    <Card variant="outlined">
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Typography
                variant="caption"
                sx={{
                    color: "text.secondary",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    display: "block",
                    mb: 0.5,
                }}
            >
                {label}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        fontVariantNumeric: "tabular-nums",
                        color: valueColor ?? "text.primary",
                        lineHeight: 1.2,
                    }}
                >
                    {value}
                </Typography>
            </Box>
            {sub && (
                <Typography variant="caption" color="text.disabled" sx={{ mt: 0.25, display: "block" }}>
                    {sub}
                </Typography>
            )}
        </CardContent>
    </Card>
);

export default StatCard;
