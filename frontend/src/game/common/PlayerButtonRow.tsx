import { Stack, ToggleButton, Typography } from "@mui/material";
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
        <Stack spacing={1}>
            <Typography variant="h3">{label[0] + label.slice(1).toLowerCase()}:</Typography>
            <Stack direction="row" spacing={1} alignContent={"center"} maxWidth={"100%"}>
                {players.map((player, idx) => (
                    <ToggleButton
                        key={idx}
                        id={`name-${label}-${idx}`}
                        sx={{
                            maxWidth: "22.5%",
                            overflow: "clip",
                            whiteSpace: "nowrap",
                            // textOverflow: "ellipsis"
                        }}
                        value={player.id}
                        selected={labelPlayerIds.includes(idx)}
                        onChange={() => onChange(idx, label)}
                    >
                        {player.username}
                    </ToggleButton>
                ))}
            </Stack>
        </Stack>
    );
};

export default PlayerButtonRow;
