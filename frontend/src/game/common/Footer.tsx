import { useState, useEffect } from "react";
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
                borderRadius: 2,
                border: "2px solid",
                borderColor: alpha(colors.border, 0.7),
                backgroundImage: `linear-gradient(to bottom, ${alpha(colors.border, 0)} 0%, ${alpha(colors.border, 0.03)} 40%, ${alpha(colors.border, 0.05)} 70%, ${alpha(colors.border, 0.1)} 100%)`,
                "&:focus-visible": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: -2,
                },
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
                        fontSize: "0.6rem",
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        color: "primary.contrastText",
                        bgcolor: "primary.main",
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
                        color: alpha(colors.border, 0.15),
                        // Stamped / letterpress effect: the glyph reads as pressed into
                        // the gradient via a dark lower shadow.
                        textShadow: `0 3px 3px ${alpha("#000000", 0.5)}}`,
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
            elevation={8}
            square
            sx={{
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1200,
                borderTop: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
            }}
        >
            <Box
                sx={{
                    maxWidth: "lg",
                    mx: "auto",
                    px: { xs: 1, sm: 2 },
                    py: { xs: 1, sm: 1.5 },
                }}
            >
                <Stack spacing={1}>
                    {hasRiichiSticks && (
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <Chip
                                icon={
                                    <Box
                                        component="img"
                                        src={riichiStick}
                                        alt=""
                                        sx={{ height: 14, px: 1 }}
                                    />
                                }
                                label={`${riichiStickCount} Riichi ${riichiStickCount === 1 ? "Stick" : "Sticks"}`}
                                color="primary"
                                variant="outlined"
                                size="small"
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
