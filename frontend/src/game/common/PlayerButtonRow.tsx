import { Box, Stack, ToggleButton, Typography } from "@mui/material";
import type { GamePlayer } from "@/types";

interface PlayerButtonRow<T extends string> {
    players: GamePlayer[];
    label: T;
    labelPlayerIds: readonly (number | undefined)[];
    onChange: (playerIndex: number, label: T) => void;
}

const PlayerButtonRow = <T extends string>({
    players,
    label,
    labelPlayerIds,
    onChange,
}: PlayerButtonRow<T>) => {
    const color = getVariant(label);
    return (
        <Box sx={{ width: "100%" }}>
            <Typography
                sx={{
                    fontWeight: 700,
                    fontSize: "0.72rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "text.secondary",
                    mb: 1,
                }}
            >
                {label[0] + label.slice(1).toLowerCase()}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                {players.map((player, idx) => {
                    const selected = labelPlayerIds.includes(idx);
                    return (
                        <ToggleButton
                            key={idx}
                            id={`name-${label}-${idx}`}
                            color={color}
                            sx={{
                                flex: 1,
                                minWidth: 0,
                                minHeight: 52,
                                px: 1,
                                py: 0.75,
                                // Long usernames wrap to two readable lines instead of
                                // being truncated mid-name (avoids aggressive ellipsis).
                                lineHeight: 1.2,
                                fontWeight: selected ? 700 : 500,
                                textAlign: "center",
                                wordBreak: "break-word",
                                hyphens: "auto",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                transition: "background-color 0.15s ease, border-color 0.15s ease",
                                "&.Mui-selected": {
                                    // Stronger, unmistakable selected state: tinted fill,
                                    // accent border, and bolder text.
                                    borderColor: `${color}.main`,
                                    bgcolor: (theme) => `${theme.palette[color].main}29`,
                                    "&:hover": {
                                        bgcolor: (theme) => `${theme.palette[color].main}38`,
                                    },
                                },
                            }}
                            value={player.id}
                            selected={selected}
                            aria-pressed={selected}
                            onChange={() => onChange(idx, label)}
                        >
                            {player.username}
                        </ToggleButton>
                    );
                })}
            </Stack>
        </Box>
    );
};

type ButtonColor = "primary" | "success" | "error";

// Semantic coloring of the selection rows: gaining roles (winner, tenpai) read
// green, losing/penalty roles (loser, pao) read red, and riichi (plus any other
// neutral role) uses the theme accent.
function getVariant(label: string): ButtonColor {
    switch (label) {
        case "WINNER":
        case "TENPAI":
            return "success";
        case "LOSER":
        case "PAO":
            return "error";
        default:
            return "primary";
    }
}

export default PlayerButtonRow;
