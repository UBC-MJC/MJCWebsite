import React, { FC } from "react";
import riichiStick from "@/assets/riichiStick.png";
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
}

const PlayerScoreCard: FC<PlayerScoreCardProps> = ({ username, score, eloDelta }) => {
    const isPositiveDelta = eloDelta >= 0;

    return (
        <Box
            sx={{
                flex: 1,
                minWidth: 0,
                textAlign: "center",
                px: { xs: 1, sm: 2 },
                py: 1.5,
                borderRadius: 2,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                    transform: "translateY(-2px)",
                },
            }}
        >
            <Typography
                variant="body2"
                sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    mb: 0.5,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }}
            >
                {username}
            </Typography>

            <Typography
                variant="h5"
                component="div"
                sx={{
                    fontWeight: 700,
                    color: "text.primary",
                    lineHeight: 1.2,
                    my: 0.5,
                }}
            >
                {score.toLocaleString()}
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

export const Footer: FC<FooterProps> = ({ scores, riichiList, riichiStickCount }) => {
    const hasRiichiSticks = riichiList && riichiList.length > 0;

    return (
        <Paper
            elevation={8}
            sx={{
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1200,
                borderRadius: "16px 16px 0 0",
                bgcolor: "background.paper",
                backdropFilter: "blur(10px)",
                borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
        >
            <Box
                sx={{
                    maxWidth: "lg",
                    mx: "auto",
                    px: { xs: 2, sm: 3 },
                    py: { xs: 2, sm: 2.5 },
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
                                        sx={{ height: 14, width: "auto" }}
                                    />
                                }
                                label={`${riichiStickCount} Riichi ${riichiStickCount === 1 ? "Stick" : "Sticks"}`}
                                color="primary"
                                variant="outlined"
                                size="small"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: "0.75rem",
                                    height: 24,
                                    borderWidth: 1.5,
                                }}
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
                        }}
                    >
                        {scores.map(({ username, score, eloDelta }, idx) => {
                            const hasRiichiStick = riichiList?.includes(idx) ?? false;
                            const adjustedScore = hasRiichiStick ? score - 1000 : score;

                            return (
                                <PlayerScoreCard
                                    key={idx}
                                    username={username}
                                    score={adjustedScore}
                                    eloDelta={eloDelta}
                                    hasRiichiStick={hasRiichiStick}
                                />
                            );
                        })}
                    </Stack>
                </Stack>
            </Box>
        </Paper>
    );
};
