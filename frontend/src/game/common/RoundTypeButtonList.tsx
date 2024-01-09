import { ToggleButton } from "react-bootstrap";

type ListToggleButtonProps<T extends string> = {
    index: number;
    name: string;
    value: T;
    checked: boolean;
    onChange: (value: T) => void;
};

const ListToggleButton = <T extends string,>({ index, name, value, checked, onChange }: ListToggleButtonProps<T>) => {
    return (
        <ToggleButton
            id={`radio-${index}`}
            type="radio"
            variant="outline-primary"
            name="round-button"
            className="my-1 w-100"
            value={value}
            checked={checked}
            onChange={() => onChange(value)}
        >
            {name}
        </ToggleButton>
    );
};

export default ListToggleButton;
