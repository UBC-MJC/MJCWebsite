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
    return (
        <Box sx={{ width: "100%" }}>
            <Typography
                sx={{
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "text.secondary",
                    textAlign: "center",
                    mb: 0.75,
                }}
            >
                {label[0] + label.slice(1).toLowerCase()}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                {players.map((player, idx) => (
                    <ToggleButton
                        key={idx}
                        id={`name-${label}-${idx}`}
                        color={getVariant(label)}
                        sx={{
                            flex: 1,
                            minWidth: 0,
                            minHeight: 44,
                            px: 1,
                            display: "block",
                            textAlign: "center",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                        value={player.id}
                        selected={labelPlayerIds.includes(idx)}
                        onChange={() => onChange(idx, label)}
                    >
                        {player.username}
                    </ToggleButton>
                ))}
            </Stack>
        </Box>
    );
};

function getVariant(label: string) {
    if (label === "RIICHI") {
        return "secondary";
    }
    return "primary";
}

export default PlayerButtonRow;
