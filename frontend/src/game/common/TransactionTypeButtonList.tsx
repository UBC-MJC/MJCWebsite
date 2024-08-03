import ToggleButton from "@mui/material/ToggleButton";

type ListToggleButtonProps = {
    key: number;
    name: string;
    value: string;
    checked: boolean;
    onChange: (value: string) => void;
};

const ListToggleButton = ({ key, name, value, checked, onChange }: ListToggleButtonProps) => {
    return (
        <ToggleButton
            key={key}
            className="my-1 w-100"
            value={value}
        >
            {name}
        </ToggleButton>
    );
};

export default ListToggleButton;
