import { useState } from "react";
import { Card, CardContent, Tooltip, Typography } from "@mui/material";

interface StatCardProps {
    label: string;
    value: string;
    /** Optional note revealed on hover / tap (kept out of the resting layout). */
    sub?: string;
    /** Optional decorative colour applied to the value text. */
    valueColor?: string;
}

/**
 * Atom — displays a single labelled metric inside a compact, center-aligned card.
 * The optional description is hidden at rest and revealed in a tooltip on hover
 * (desktop) or tap (mobile), so the card stays small. Scales from 1 to N stats
 * by dropping into any Grid container.
 */
const StatCard = ({ label, value, sub, valueColor }: StatCardProps) => {
    const [open, setOpen] = useState(false);

    const card = (
        <Card
            variant="outlined"
            sx={{ height: "100%", minWidth: 0, cursor: sub ? "help" : "default" }}
            // Reveal the description on hover, focus, or tap.
            {...(sub
                ? {
                      tabIndex: 0,
                      "aria-label": `${label}: ${value}. ${sub}`,
                      onMouseEnter: () => setOpen(true),
                      onMouseLeave: () => setOpen(false),
                      onFocus: () => setOpen(true),
                      onBlur: () => setOpen(false),
                      onClick: () => setOpen((prev) => !prev),
                  }
                : {})}
        >
            <CardContent
                sx={{
                    p: { xs: 0.75, sm: 1.25 },
                    textAlign: "center",
                    minWidth: 0,
                    overflowWrap: "anywhere",
                    "&:last-child": { pb: { xs: 0.75, sm: 1.25 } },
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: "text.secondary",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        display: "block",
                        // Fluidly scales with the viewport so rows never need to reflow.
                        fontSize: "clamp(0.62rem, 1.6vw, 0.8rem)",
                        mb: 0.25,
                    }}
                >
                    {label}
                </Typography>
                <Typography
                    sx={{
                        fontWeight: 700,
                        fontVariantNumeric: "tabular-nums",
                        color: valueColor ?? "text.primary",
                        lineHeight: 1.2,
                        fontSize: "clamp(0.8rem, 2.4vw, 1.35rem)",
                    }}
                >
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );

    if (!sub) {
        return card;
    }

    return (
        <Tooltip
            title={sub}
            arrow
            open={open}
            // Card events drive visibility, so disable the Tooltip's own listeners.
            disableHoverListener
            disableFocusListener
            disableTouchListener
            onClose={() => setOpen(false)}
        >
            {card}
        </Tooltip>
    );
};

export default StatCard;
