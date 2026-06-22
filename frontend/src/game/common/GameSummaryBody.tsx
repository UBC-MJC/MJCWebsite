import { Box, Chip, Divider, Stack, Typography, alpha } from "@mui/material";
import { getScoresWithPlayers } from "@/common/Utils";
import type { Game, GameVariant } from "@/types";
import { placeColor, placeLabel } from "./placement";

const columnTitleSx = {
    display: "block",
    fontWeight: 700,
    fontSize: "0.78rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "text.secondary",
    mb: 0.5,
} as const;

const GameSummaryBody = <T extends GameVariant>({
    game,
    gameVariant,
}: {
    game: Game<T>;
    gameVariant: T;
}) => {
    const sorted = getScoresWithPlayers(game, gameVariant).sort((a, b) => b.score - a.score);
    const hasElo = sorted.some((s) => s.eloDelta !== undefined);

    const ROW_H = 46;

    return (
        <Box sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
            {/* Name + score box */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ ...columnTitleSx, textAlign: "center" }}>Score</Typography>
                <Stack
                    divider={<Divider sx={{ borderColor: "divider", opacity: 0.5 }} />}
                    sx={{
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.default",
                        overflow: "hidden",
                    }}
                >
                {sorted.map((score, idx) => {
                    const colors = placeColor(idx);
                    return (
                        <Box
                            key={idx}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                px: 1.25,
                                minHeight: ROW_H,
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 700,
                                    width: 28,
                                    flexShrink: 0,
                                    color: colors.text,
                                    fontSize: "0.9rem",
                                }}
                            >
                                {placeLabel(idx)}
                            </Typography>
                            <Divider
                                orientation="vertical"
                                flexItem
                                sx={{ borderColor: "divider", opacity: 0.5, my: 1 }}
                            />
                            <Typography
                                variant="body2"
                                sx={{
                                    flex: 1,
                                    textAlign: "left",
                                    fontSize: "1.05rem",
                                    fontWeight: 600,
                                    color: "text.primary",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {score.username}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 650,
                                    fontVariantNumeric: "tabular-nums",
                                    color: "text.primary",
                                    fontSize: "1.05rem",
                                    minWidth: 64,
                                    textAlign: "right",
                                    flexShrink: 0,
                                    p: "1px",
                                }}
                            >
                                {score.score.toLocaleString()}
                            </Typography>
                        </Box>
                    );
                    })}
                </Stack>
            </Box>

            {/* Separated elo-change column — its own subtle panel */}
            {hasElo && (
                <Box sx={{ flexShrink: 0 }}>
                    <Typography sx={{ ...columnTitleSx, textAlign: "center" }}>ELO Change</Typography>
                    <Stack
                        divider={<Divider sx={{ borderColor: "divider", opacity: 0.5 }} />}
                        sx={{
                            borderRadius: 1.5,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "background.default",
                            overflow: "hidden",
                        }}
                    >
                        {sorted.map((score, idx) => (
                            <Box
                                key={idx}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    minHeight: ROW_H,
                                    px: 1.25,
                                }}
                            >
                                {score.eloDelta !== undefined ? (
                                    <Chip
                                        size="small"
                                        label={`${score.eloDelta > 0 ? "+" : ""}${score.eloDelta.toFixed(2)}`}
                                        sx={(t) => {
                                            const main =
                                                score.eloDelta! > 0
                                                    ? t.palette.success.main
                                                    : score.eloDelta! < 0
                                                      ? t.palette.error.main
                                                      : t.palette.text.disabled;
                                            return {
                                                width: 92,
                                                height: ROW_H - 10,
                                                borderRadius: 1.5,
                                                fontWeight: 700,
                                                fontSize: "1rem",
                                                fontVariantNumeric: "tabular-nums",
                                                color: main,
                                                bgcolor: alpha(main, 0.16),
                                                border: "none",
                                                "& .MuiChip-label": { px: 1, width: "100%", textAlign: "center" },
                                            };
                                        }}
                                    />
                                ) : (
                                    <Box sx={{ width: 92, height: ROW_H - 10 }} />
                                )}
                            </Box>
                        ))}
                    </Stack>
                </Box>
            )}
        </Box>
    );
};

export default GameSummaryBody;