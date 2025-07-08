import React, { FC } from "react";
import { PickerData } from "react-simple-wheel-picker";
import { Autocomplete, TextField, Stack } from "@mui/material";
interface DropdownInputProps {
    label: string;
    data: PickerData[];
    onChange: (value: any) => void;
}

const DropdownInput: FC<DropdownInputProps> = ({ label, data, onChange }) => {
    const options = transformToSelectOptions(data);
    return (
        <Stack spacing={1}>
            <h6>{label}:</h6>
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
