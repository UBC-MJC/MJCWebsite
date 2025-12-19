import { useState, useEffect } from "react";
import riichiStick from "@/assets/riichiStick.png";
import { responsiveTextTruncate } from "@/theme/utils";
import { Box, Stack, Typography, Paper, Chip, alpha } from "@mui/material";

interface FooterProps {
    scores: { username: string; score: number; eloDelta: number }[];
    riichiList?: number[];
    riichiStickCount?: number;
}

interface PlayerScoreCardProps {
    username: string;
    score: number;
    eloDelta: number;
    hasRiichiStick?: boolean;
    isSelected?: boolean;
    scoreDifference?: number | null;
    onClick?: () => void;
}

const PlayerScoreCard = ({
    username,
    score,
    eloDelta,
    isSelected = false,
    scoreDifference = null,
    onClick,
}: PlayerScoreCardProps) => {
    const isPositiveDelta = eloDelta >= 0;
    const showDifference = scoreDifference !== null && scoreDifference !== undefined;
    const isPositiveDifference = scoreDifference !== null && scoreDifference >= 0;

    return (
        <Box
            onClick={onClick}
            sx={{
                flex: 1,
                minWidth: 0,
                px: { xs: 1, sm: 2 },
                py: 1.5,
                borderRadius: 2,
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                border: 2,
                borderColor: "transparent",
                userSelect: "none",
                // Selected state styling
                ...(isSelected && {
                    borderColor: (theme) => theme.palette.primary.main,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    transform: "scale(1.02)",
                }),
                // Hover effect (disabled when selected)
                ...(!isSelected && {
                    "&:hover": {
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                        transform: "translateY(-2px)",
                    },
                }),
            }}
        >
            <Typography
                variant="body2"
                sx={{
                    ...responsiveTextTruncate,
                }}
            >
                {username}
            </Typography>

            <Typography
                variant="h5"
                component="div"
                sx={{
                    fontWeight: 700,
                    ...(showDifference && {
                        color: isPositiveDifference ? "error.main" : "success.main",
                    }),
                }}
            >
                {showDifference
                    ? `${scoreDifference >= 0 ? "+" : ""}${scoreDifference.toLocaleString()}`
                    : score.toLocaleString()}
            </Typography>

            <Chip
                label={`${isPositiveDelta ? "+" : ""}${eloDelta.toFixed(1)}`}
                size="small"
                sx={{
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    height: 24,
                    bgcolor: isPositiveDelta
                        ? (theme) => alpha(theme.palette.success.main, 0.1)
                        : (theme) => alpha(theme.palette.error.main, 0.1),
                    color: isPositiveDelta ? "success.main" : "error.main",
                    border: "none",
                }}
            />
        </Box>
    );
};

export const Footer = ({ scores, riichiList, riichiStickCount }: FooterProps) => {
    const [selectedScoreIndex, setSelectedScoreIndex] = useState<number | null>(null);
    const hasRiichiSticks = riichiList && riichiList.length > 0;

    // Reset selection if scores array changes
    useEffect(() => {
        if (selectedScoreIndex !== null && selectedScoreIndex >= scores.length) {
            setSelectedScoreIndex(null);
        }
    }, [scores.length, selectedScoreIndex]);

    const handleScoreClick = (index: number) => {
        setSelectedScoreIndex(selectedScoreIndex === index ? null : index);
    };

    return (
        <Paper
            elevation={8}
            sx={{
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1200,
            }}
        >
            <Box
                sx={{
                    maxWidth: "lg",
                    mx: "auto",
                    py: 2
                }}
            >
                <Stack spacing={1}>
                    {riichiStickCount !== undefined && hasRiichiSticks && (
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <Chip
                                icon={
                                    <Box
                                        component="img"
                                        src={riichiStick}
                                        alt="Riichi stick"
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
                    <Stack
                        direction="row"
                        spacing={{ xs: 1, sm: 2 }}
                        justifyContent="center"
                        alignItems="stretch"
                        sx={{
                            flexWrap: { xs: "wrap", sm: "nowrap" },
                            px: 1
                        }}
                    >
                        {scores.map(({ username, score, eloDelta }, idx) => {
                            const hasRiichiStick = riichiList?.includes(idx) ?? false;
                            const adjustedScore = hasRiichiStick ? score - 1000 : score;

                            // Calculate difference if a score is selected
                            let scoreDifference: number | null = null;
                            if (selectedScoreIndex !== null && selectedScoreIndex !== idx) {
                                const selectedHasRiichi = riichiList?.includes(selectedScoreIndex) ?? false;
                                const selectedAdjustedScore = selectedHasRiichi
                                    ? scores[selectedScoreIndex].score - 1000
                                    : scores[selectedScoreIndex].score;
                                scoreDifference = adjustedScore - selectedAdjustedScore;
                            }

                            return (
                                <PlayerScoreCard
                                    key={idx}
                                    username={username}
                                    score={adjustedScore}
                                    eloDelta={eloDelta}
                                    hasRiichiStick={hasRiichiStick}
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
