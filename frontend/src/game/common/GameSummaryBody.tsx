import { Box, Chip, Divider, Grid, Stack, Typography, alpha } from "@mui/material";
import { getScoresWithPlayers } from "@/common/Utils";
import type { Game, GameVariant } from "@/types";
import { palette } from "@/theme/tokens";

const placeLabel = (idx: number) => {
    switch (idx) {
        case 0: return "1st";
        case 1: return "2nd";
        case 2: return "3rd";
        default: return `${idx + 1}th`;
    }
};

const PLACE_COLORS = [
    { bg: palette.medal.gold.bg,   text: palette.medal.gold.text,   border: "#F5D060" },
    { bg: palette.medal.silver.bg, text: palette.medal.silver.text, border: "#C0C0C0" },
    { bg: palette.medal.bronze.bg, text: palette.medal.bronze.text, border: "#CD7F32" },
] as const;

const placeColor = (idx: number) =>
    PLACE_COLORS[idx] ?? { bg: "background.default", text: "text.secondary", border: "divider" };

const GameSummaryBody = <T extends GameVariant>({
    game,
    gameVariant,
}: {
    game: Game<T>;
    gameVariant: T;
}) => {
    const sorted = getScoresWithPlayers(game, gameVariant).sort((a, b) => b.score - a.score);

    return (
        <Stack
            divider={<Divider flexItem sx={{ borderColor: "divider", opacity: 0.5 }} />}
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
                const isWinner = idx === 0;
                return (
                    <Box
                        key={idx}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            py: 1.25,
                            px: 1.25,
                            transition: "background 0.12s",
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 700,
                                width: 28,
                                flexShrink: 0,
                                color: colors.text,
                                fontSize: "0.8rem",
                            }}
                        >
                            {placeLabel(idx)}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                flex: 1,
                                textAlign: "left",
                                fontSize: "0.95rem",
                                fontWeight: isWinner ? 600 : 400,
                                color: isWinner ? "text.primary" : "text.secondary",
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
                                fontWeight: 600,
                                fontVariantNumeric: "tabular-nums",
                                color: isWinner ? "success.main" : score.score < 0 ? "error.main" : "text.secondary",
                                fontSize: "0.95rem",
                                minWidth: 64,
                                textAlign: "right",
                                flexShrink: 0,
                            }}
                        >
                            {score.score.toLocaleString()}
                        </Typography>
                        {score.eloDelta !== undefined && (
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
                                        flexShrink: 0,
                                        width: 72,
                                        height: 22,
                                        ml: 1.25,
                                        fontWeight: 700,
                                        fontSize: "0.75rem",
                                        fontVariantNumeric: "tabular-nums",
                                        color: main,
                                        bgcolor: alpha(main, 0.16),
                                        border: "1px solid",
                                        borderColor: alpha(main, 0.3),
                                        "& .MuiChip-label": { px: 1, width: "100%", textAlign: "center" },
                                    };
                                }}
                            />
                        )}
                    </Box>
                );
            })}
        </Stack>
    );
};

export default GameSummaryBody;