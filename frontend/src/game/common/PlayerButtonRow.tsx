import { JapaneseLabel } from "./constants";
import React from "react";
import { Checkbox, FormControlLabel, FormGroup, FormLabel, Radio } from "@mui/material";

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
    const formOnChange = (playerIndex: number) => {
        return () => {
            return onChange(playerIndex, label);
        };
    };
    return (
        <FormGroup row className={"justify-content-center align-items-center"}>
            <FormLabel component="legend"> {label} </FormLabel>
            {players.map((player, idx) => (
                <FormControlLabel
                    label={player.username}
                    key={player.id}
                    sx={{
                        maxWidth: "15%",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                    }}
                    control={
                        isMulti(label) ? (
                            <Checkbox
                                checked={labelPlayerIds.includes(idx)}
                                onChange={formOnChange(idx)}
                                color={getVariant(label)}
                            />
                        ) : (
                            <Radio
                                checked={labelPlayerIds.includes(idx)}
                                onChange={formOnChange(idx)}
                                color={getVariant(label)}
                            />
                        )
                    }
                    labelPlacement="top"
                ></FormControlLabel>
            ))}
        </FormGroup>
    );
};

const isMulti = (label: string) => {
    return label === JapaneseLabel.TENPAI || label === "RIICHI";
};

function getVariant(label: string) {
    if (label === "RIICHI") {
        return "secondary";
    }
    return "primary";
}

export default PlayerButtonRow;
