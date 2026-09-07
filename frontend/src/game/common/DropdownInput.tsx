import { PickerData } from "react-simple-wheel-picker";
import { Autocomplete, TextField, Stack, Typography } from "@mui/material";

interface DropdownInputProps {
    label: string;
    data: PickerData[];
    onChange: (value: string) => void;
}

const DropdownInput = ({ label, data, onChange }: DropdownInputProps) => {
    const options = transformToSelectOptions(data);
    return (
        <Stack spacing={1}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {label}:
            </Typography>
            <Autocomplete
                isOptionEqualToValue={(option, value) => option.label === value.label}
                size={"small"}
                options={options}
                onChange={(event, value) => onChange(value!.label)}
                renderInput={(params) => <TextField {...params} placeholder={label} />}
            />
        </Stack>
    );
};

const transformToSelectOptions = (list: PickerData[]) => {
    return list.map((data) => {
        return { label: data.id };
    });
};

export default DropdownInput;
