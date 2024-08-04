import React from "react";
import { ToggleButton } from "@mui/material";

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
            {players.map((player, idx) => (
                <ToggleButton
                    key={idx}
                    id={`name-${label}-${idx}`}
                    color={getVariant(label)}
                    sx={{
                        maxWidth: "22.5%",
                        overflow: "clip",
                        whiteSpace: "nowrap",
                        // textOverflow: "ellipsis"
                    }}
                    className="mx-1 my-1"
                    value={player.id}
                    selected={labelPlayerIds.includes(idx)}
                    onChange={() => onChange(idx, label)}
                >
                    {player.username}
                </ToggleButton>
            ))}
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
