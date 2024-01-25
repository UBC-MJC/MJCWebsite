import { ToggleButton } from "react-bootstrap";

type ListToggleButtonProps = {
    index: number;
    name: string;
    value: string;
    checked: boolean;
    onChange: (value: string) => void;
};

const ListToggleButton = ({ index, name, value, checked, onChange }: ListToggleButtonProps) => {
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
