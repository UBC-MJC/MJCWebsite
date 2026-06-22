import { PickerData } from "react-simple-wheel-picker";
import { Autocomplete, TextField, Stack, Typography } from "@mui/material";

interface DropdownInputProps {
    label: string;
    data: PickerData[];
    onChange: (value: string) => void;
    /** When provided, the input becomes controlled and reflects this value. */
    value?: string;
}

const DropdownInput = ({ label, data, onChange, value }: DropdownInputProps) => {
    const options = transformToSelectOptions(data);
    const selectedOption =
        value === undefined ? undefined : (options.find((o) => o.label === value) ?? null);

    return (
        <Stack spacing={1} alignItems="center">
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {label}
            </Typography>
            <Autocomplete
                isOptionEqualToValue={(option, val) => option.label === val.label}
                size="medium"
                options={options}
                value={selectedOption}
                onChange={(_event, val) => val && onChange(val.label)}
                sx={{ width: { xs: 96, sm: 120 } }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        placeholder={label}
                        // han/fu/dora are numeric — surface the number pad on mobile
                        // instead of the full alphabetic keyboard.
                        inputProps={{ ...params.inputProps, inputMode: "numeric" }}
                    />
                )}
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
