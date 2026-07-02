import { useState } from "react";
import { Box, Typography, Chip, alpha } from "@mui/material";
import { keyframes } from "@mui/system";
import { placeColor, placeLabel } from "./placement";

// Quick "pop" played when a player's card is tapped.
const pop = keyframes`
    0%   { transform: scale(1);    }
    40%  { transform: scale(0.95); }
    100% { transform: scale(1);    }
`;

const windName = (wind: string) => wind.charAt(0) + wind.slice(1).toLowerCase();

// Accent ring marking the dealer's card. A pseudo-element fills the box with the
// title gradient, then a mask keeps only the border frame (border-box minus
// content-box) and fades it to transparent toward the bottom so the gradient
// border tapers like the place-color border below it. The mask image/clip are
// identical across specs; only the composite operators differ.
const dealerRingMaskImage =
    "linear-gradient(to bottom, #000 0%, transparent 100%), linear-gradient(#000 0 0), linear-gradient(#000 0 0)";
const dealerRingMaskClip = "border-box, content-box, border-box";

const dealerRing = {
    "&::before": {
        content: '""',
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        padding: "2px",
        background: "var(--mui-palette-gradient-title)",
        maskImage: dealerRingMaskImage,
        WebkitMaskImage: dealerRingMaskImage,
        maskClip: dealerRingMaskClip,
        WebkitMaskClip: dealerRingMaskClip,
        maskComposite: "intersect, exclude, add",
        WebkitMaskComposite: "source-in, xor, source-over",
        pointerEvents: "none",
        zIndex: 2,
    },
} as const;

interface PlayerScoreCardProps {
    username: string;
    score: number;
    eloDelta: number;
    place: number;
    wind?: string;
    isSelected?: boolean;
    scoreDifference?: number | null;
    onClick?: () => void;
}

const PlayerScoreCard = ({
    username,
    score,
    eloDelta,
    place,
    wind,
    isSelected = false,
    scoreDifference = null,
    onClick,
}: PlayerScoreCardProps) => {
    const isPositiveDelta = eloDelta >= 0;
    const showDifference = scoreDifference !== null && scoreDifference !== undefined;
    // Difference is shown relative to the selected player: a player who is ahead
    // of the selected one reads red (gap to close), behind reads green.
    const isPositiveDifference = scoreDifference !== null && scoreDifference >= 0;
    const colors = placeColor(place);
    const isDealer = wind === "EAST";

    const [animating, setAnimating] = useState(false);
    const triggerClick = () => {
        setAnimating(true);
        onClick?.();
    };

    return (
        <Box
            onClick={triggerClick}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    triggerClick();
                }
            }}
            onAnimationEnd={() => setAnimating(false)}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            aria-label={`${wind ? `${windName(wind)} wind, ` : ""}${username}, score ${score.toLocaleString()}`}
            sx={{
                position: "relative",
                flex: 1,
                minWidth: 0,
                px: { xs: 0.75, sm: 1.5 },
                pt: { xs: 2, sm: 2.25 },
                pb: { xs: 1, sm: 1.25 },
                cursor: "pointer",
                userSelect: "none",
                textAlign: "center",
                transition: "background-color 0.18s ease",
                // Finishing position is shown by a colored border plus a top→bottom
                // gradient of the place color (transparent at top, solid at bottom).
                borderRadius: 1,
                borderBottom: `5px solid ${alpha(colors.border, 0.8)}`,
                backgroundImage: `linear-gradient(to bottom, ${alpha(colors.border, 0)} 50%, ${alpha(colors.border, 0.1)} 100%)`,
                ...(isDealer && dealerRing),
                ...(isSelected && {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
                }),
                ...(!isSelected && {
                    "&:hover": {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                    },
                }),
                ...(animating && {
                    animation: `${pop} 0.22s ease`,
                    "@media (prefers-reduced-motion: reduce)": {
                        animation: "none",
                    },
                }),
            }}
        >
            {/* "DEALER" chip straddling the top edge of the dealer's card. */}
            {isDealer && (
                <Chip
                    label="DEALER"
                    size="small"
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 3,
                        height: 18,
                        fontSize: "0.65rem",
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        color: "var(--mui-palette-background-default)",
                        background: "var(--mui-palette-gradient-title)",
                        "& .MuiChip-label": { px: 1.5 },
                    }}
                />
            )}
            <Box sx={{ position: "relative", zIndex: 1 }}>
                <Typography
                    variant="caption"
                    title={username}
                    sx={{
                        display: "block",
                        color: "text.secondary",
                        fontWeight: 600,
                        fontSize: { xs: "0.85rem", sm: "0.95rem" },
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        // Nudge the name slightly upward within the restored top padding.
                        mt: { xs: -0.75, sm: -1 },
                        mb: 0.25,
                    }}
                >
                    {username}
                </Typography>

                <Typography
                    component="div"
                    sx={{
                        fontWeight: 800,
                        lineHeight: 1.1,
                        fontSize: { xs: "1.05rem", sm: "1.35rem" },
                        fontVariantNumeric: "tabular-nums",
                        ...(showDifference
                            ? { color: isPositiveDifference ? "error.main" : "success.main" }
                            : { color: "text.primary" }),
                    }}
                >
                    {showDifference
                        ? `${scoreDifference >= 0 ? "+" : ""}${scoreDifference.toLocaleString()}`
                        : score.toLocaleString()}
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.5,
                        mt: 0.5,
                    }}
                >
                    {/* Finishing position — keeps rank legible without relying on color. */}
                    <Chip
                        label={placeLabel(place)}
                        size="small"
                        sx={{
                            flexShrink: 0,
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            color: colors.text,
                            bgcolor: alpha(colors.border, 0.16),
                            border: "none",
                            "& .MuiChip-label": { px: 0.75 },
                        }}
                    />
                    <Chip
                        label={`${isPositiveDelta ? "+" : ""}${eloDelta.toFixed(1)}`}
                        size="small"
                        sx={{
                            fontWeight: 700,
                            fontVariantNumeric: "tabular-nums",
                            bgcolor: (theme) =>
                                alpha(
                                    isPositiveDelta
                                        ? theme.palette.success.main
                                        : theme.palette.error.main,
                                    0.16,
                                ),
                            color: isPositiveDelta ? "success.main" : "error.main",
                            border: "none",
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default PlayerScoreCard;
