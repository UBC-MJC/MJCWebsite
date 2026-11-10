import { Box, Stack, ToggleButton, Typography } from "@mui/material";
import type { GamePlayer } from "@/types";
import { responsiveTextTruncate } from "@/theme/utils";

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
        <Stack spacing={1}>
            <Typography variant="h3">{label[0] + label.slice(1).toLowerCase()}:</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 1 }}>
                {players.map((player, idx) => (
                    <ToggleButton
                        key={idx}
                        id={`name-${label}-${idx}`}
                        sx={{ minWidth: 0, px: 0.5 }}
                        value={player.id}
                        selected={labelPlayerIds.includes(idx)}
                        onChange={() => onChange(idx, label)}
                    >
                        <Box component="span" sx={responsiveTextTruncate}>
                            {player.username}
                        </Box>
                    </ToggleButton>
                ))}
            </Box>
        </Stack>
    );
};

export default PlayerButtonRow;
