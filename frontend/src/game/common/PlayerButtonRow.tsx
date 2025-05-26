import React from "react";
import { Stack, ToggleButton } from "@mui/material";

type PlayerButtonRow<T extends string> = {
    players: GamePlayer[];
    label: T;
    labelPlayerIds: (number | undefined)[];
    onChange: (playerIndex: number, label: T) => void;
};

const PlayerButtonRow = <T extends string>({
    players,
    label,
    labelPlayerIds,
    onChange,
}: PlayerButtonRow<T>) => {
    return (
        <>
        <h5>{label[0] + label.slice(1).toLowerCase()}:</h5>
        <Stack direction="row" spacing={1}>
            {players.map((player, idx) => (
                <ToggleButton
                    key={idx}
                    id={`name-${label}-${idx}`}
                    color={getVariant(label)}
                    value={player.id}
                    selected={labelPlayerIds.includes(idx)}
                    onChange={() => onChange(idx, label)}
                >
                    {player.username}
                </ToggleButton>
            ))}
        </Stack>
        </>
    );
};

function getVariant(label: string) {
    if (label === "RIICHI") {
        return "secondary";
    }
    return "primary";
}

export default PlayerButtonRow;
