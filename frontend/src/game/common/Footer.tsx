import { useState, useEffect, useRef } from "react";
import riichiStick from "@/assets/riichiStick.png";
import { Box, Stack, Typography, Paper, Chip, alpha } from "@mui/material";
import { keyframes } from "@mui/system";
import { mapWindToCharacter } from "@/common/Utils";
import { computePlaces, placeColor, placeLabel } from "./placement";

// Quick "pop" played when a player's card is tapped.
const pop = keyframes`
    0%   { transform: scale(1);    }
    40%  { transform: scale(0.95); }
    100% { transform: scale(1);    }
`;

// Seat winds in turn order; the current dealer (East) anchors the rotation.
const WIND_ORDER = ["EAST", "SOUTH", "WEST", "NORTH"] as const;

const windName = (wind: string) => wind.charAt(0) + wind.slice(1).toLowerCase();

interface FooterProps {
    scores: { username: string; score: number; eloDelta: number }[];
    riichiList?: number[];
    riichiStickCount?: number;
    /** Seat index of the current dealer (East). Omit when the game is over. */
    dealerIndex?: number;
}

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
                borderBottom: `5px solid ${alpha(colors.border, 0.6)}`,
                backgroundImage: `linear-gradient(to bottom, ${alpha(colors.border, 0)} 0%, ${alpha(colors.border, 0.03)} 40%, ${alpha(colors.border, 0.05)} 70%, ${alpha(colors.border, 0.1)} 100%)`,
                "&:focus-visible": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: -2,
                },
                // Accent ring marking the dealer's card. Drawn as a masked
                // pseudo-element: the background carries the white→accent gradient
                // hue, while the mask is the border frame (border-box minus
                // content-box) intersected with a top→bottom fade, so the gradient
                // border also tapers to transparent at the bottom (where the place
                // color border takes over).
                ...(isDealer && {
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        borderRadius: "inherit",
                        padding: "2px",
                        background: "var(--mui-palette-gradient-title)",
                        maskImage:
                            "linear-gradient(to bottom, #000 0%, transparent 100%), linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
                        maskClip: "border-box, content-box, border-box",
                        maskComposite: "intersect, exclude, add",
                        WebkitMaskImage:
                            "linear-gradient(to bottom, #000 0%, transparent 100%), linear-gradient(#000 0 0), linear-gradient(#000 0 0)",
                        WebkitMaskClip: "border-box, content-box, border-box",
                        WebkitMaskComposite: "source-in, xor, source-over",
                        pointerEvents: "none",
                        zIndex: 2,
                    },
                }),
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
                        // Ink that contrasts the title gradient's neutral end in
                        // either scheme (dark on the light end, light on the dark end).
                        color: "var(--mui-palette-background-default)",
                        background: "var(--mui-palette-gradient-title)",
                        "& .MuiChip-label": { px: 1.5 },
                    }}
                />
            )}
            {/* Large wind character watermark, tinted to blend into the position gradient. */}
            {wind && (
                <Box
                    aria-hidden
                    sx={{
                        position: "absolute",
                        inset: 0,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 0,
                        pointerEvents: "none",
                        fontSize: { xs: "5.5rem", sm: "5rem" },
                        fontWeight: 750,
                        lineHeight: 1,
                        color: alpha(colors.border, 0.1),
                        textShadow: `0 5px 5px ${alpha("#000000", 0.2)}`,
                    }}
                >
                    {mapWindToCharacter(wind)}
                </Box>
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
                        height: 18,
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
                        height: 22,
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

export const Footer = ({ scores, riichiList, riichiStickCount, dealerIndex }: FooterProps) => {
    const [selectedScoreIndex, setSelectedScoreIndex] = useState<number | null>(null);
    const footerRef = useRef<HTMLDivElement>(null);

    // Publish the footer's real height (including the safe-area inset) as a CSS
    // variable so pages can pad their scroll area by exactly this much instead of
    // guessing with magic numbers. It changes at runtime (e.g. the riichi-stick
    // row appears/disappears), so a ResizeObserver keeps it in sync.
    useEffect(() => {
        const el = footerRef.current;
        if (!el) {
            return;
        }
        const root = document.documentElement;
        const publish = () =>
            root.style.setProperty("--game-footer-height", `${el.offsetHeight}px`);
        publish();
        const observer = new ResizeObserver(publish);
        observer.observe(el);
        return () => {
            observer.disconnect();
            root.style.removeProperty("--game-footer-height");
        };
    }, []);
    // Show the pot whenever any riichi sticks sit on the table — including ones
    // carried over from previous rounds, even if no one has riichi'd this round.
    const hasRiichiSticks = riichiStickCount !== undefined && riichiStickCount > 0;

    // Reset selection if scores array changes
    useEffect(() => {
        if (selectedScoreIndex !== null && selectedScoreIndex >= scores.length) {
            setSelectedScoreIndex(null);
        }
    }, [scores.length, selectedScoreIndex]);

    const handleScoreClick = (index: number) => {
        setSelectedScoreIndex(selectedScoreIndex === index ? null : index);
    };

    // Rank players by their (riichi-adjusted) score to show finishing position.
    const adjustedScores = scores.map(({ score }, idx) =>
        riichiList?.includes(idx) ? score - 1000 : score,
    );
    const places = computePlaces(adjustedScores);

    return (
        <Paper
            ref={footerRef}
            elevation={8}
            square
            sx={{
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1200,
                // Transparent base so the gradient's transparent end is genuinely
                // see-through: the paper surface fades in via an alpha gradient
                // (transparent at the top → solid toward the bottom), letting page
                // content show behind the top of the footer for a smooth transition.
                bgcolor: "transparent",
                backgroundImage: "var(--mui-palette-gradient-footerFade)",
            }}
        >
            <Box
                sx={{
                    maxWidth: "lg",
                    mx: "auto",
                    px: { xs: 1, sm: 2 },
                    pt: { xs: 1, sm: 1.5 },
                    // Keep the cards above the home indicator on notched phones.
                    pb: {
                        xs: "calc(8px + env(safe-area-inset-bottom))",
                        sm: "calc(12px + env(safe-area-inset-bottom))",
                    },
                }}
            >
                <Stack spacing={hasRiichiSticks ? 2 : 1}>
                    {hasRiichiSticks && (
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <Chip
                                icon={
                                    <Box
                                        component="img"
                                        src={riichiStick}
                                        alt=""
                                        sx={{ height: 18, px: 1 }}
                                    />
                                }
                                label={`${riichiStickCount} Riichi ${riichiStickCount === 1 ? "Stick" : "Sticks"}`}
                                variant="outlined"
                                sx={{
                                    position: "relative",
                                    height: 34,
                                    fontSize: "0.9rem",
                                    fontWeight: 700,
                                    background: "transparent",
                                    // Hide the default solid outline; the gradient border
                                    // is drawn by the masked ::before below.
                                    border: "1px solid transparent",
                                    // Clip the white→accent gradient into the label text.
                                    "& .MuiChip-label": {
                                        px: 1.5,
                                        background: "var(--mui-palette-gradient-title)",
                                        backgroundClip: "text",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                    },
                                    // Gradient outline that follows the pill shape: a
                                    // border-box-minus-content-box mask leaves only the ring.
                                    "&::before": {
                                        content: '""',
                                        position: "absolute",
                                        inset: 0,
                                        borderRadius: "inherit",
                                        padding: "1.5px",
                                        background: "var(--mui-palette-gradient-title)",
                                        WebkitMask:
                                            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                        WebkitMaskComposite: "xor",
                                        maskComposite: "exclude",
                                        pointerEvents: "none",
                                    },
                                }}
                            />
                        </Box>
                    )}
                    <Stack direction="row" alignItems="stretch" spacing={1}>
                        {scores.map(({ username, eloDelta }, idx) => {
                            const adjustedScore = adjustedScores[idx];
                            const wind =
                                dealerIndex !== undefined
                                    ? WIND_ORDER[(idx - dealerIndex + 4) % 4]
                                    : undefined;

                            // Calculate difference if a score is selected
                            let scoreDifference: number | null = null;
                            if (selectedScoreIndex !== null && selectedScoreIndex !== idx) {
                                scoreDifference =
                                    adjustedScore - adjustedScores[selectedScoreIndex];
                            }

                            return (
                                <PlayerScoreCard
                                    key={idx}
                                    username={username}
                                    score={adjustedScore}
                                    eloDelta={eloDelta}
                                    place={places[idx]}
                                    wind={wind}
                                    isSelected={selectedScoreIndex === idx}
                                    scoreDifference={scoreDifference}
                                    onClick={() => handleScoreClick(idx)}
                                />
                            );
                        })}
                    </Stack>
                </Stack>
            </Box>
        </Paper>
    );
};
