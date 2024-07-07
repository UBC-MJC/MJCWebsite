import { Col, Container, Row, ToggleButton } from "react-bootstrap";
import { JapaneseLabel } from "./constants";
import React from "react";

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
            {players.map((player, idx) => (
                <ToggleButton
                    key={idx}
                    id={`name-${label}-${idx}`}
                    type={getToggleType(label)}
                    variant={getVariant(label)}
                    style={{
                        maxWidth: "22.5%",
                        overflow: "clip",
                        whiteSpace: "nowrap",
                        // textOverflow: "ellipsis"
                    }}
                    name={label + "-button"}
                    className="mx-1 my-1"
                    value={player.id}
                    checked={labelPlayerIds.includes(idx)}
                    onChange={() => onChange(idx, label)}
                >
                    {player.username}
                </ToggleButton>
            ))}
        </>
    );
};

const getToggleType = (label: string) => {
    if (label === JapaneseLabel.TENPAI || label === "RIICHI") {
        return "checkbox";
    }
    return "radio";
};

function getVariant(label: string): string {
    if (label === "RIICHI") {
        return "outline-secondary";
    }
    return "outline-primary";
}

export default PlayerButtonRow;
