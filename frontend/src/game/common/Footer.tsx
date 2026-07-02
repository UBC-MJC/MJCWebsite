import { useState, useEffect, useRef } from "react";
import riichiStick from "@/assets/riichiStick.png";
import { Box, Stack, Paper, Chip } from "@mui/material";
import PlayerScoreCard from "./PlayerScoreCard";
import { computePlaces } from "./placement";

// Seat winds in turn order; the current dealer (East) anchors the rotation.
const WIND_ORDER = ["EAST", "SOUTH", "WEST", "NORTH"] as const;

interface FooterProps {
    scores: { username: string; score: number; eloDelta: number }[];
    riichiList?: number[];
    riichiStickCount?: number;
    /** Seat index of the current dealer (East). Omit when the game is over. */
    dealerIndex?: number;
}

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
            elevation={0}
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
