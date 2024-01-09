import { ToggleButton } from "react-bootstrap";
import { JapaneseLabel } from "./constants";

type PlayerButtonRow<T extends string> = {
    players: GamePlayer[];
    label: T;
    labelPlayerIds: (number | undefined)[];
    onChange: (playerIndex: number, label: T) => void;
};

const PlayerButtonRow = <T extends string,>({ players, label, labelPlayerIds, onChange }: PlayerButtonRow<T>) => {
    return (
        <>
            {players.map((player, idx) => (
                <ToggleButton
                    key={idx}
                    id={`name-${label}-${idx}`}
                    type={getToggleType(label)}
                    variant="outline-primary"
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
}

export default PlayerButtonRow;
