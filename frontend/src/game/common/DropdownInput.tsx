import React, { FC } from "react";
import { PickerData } from "react-simple-wheel-picker";
import { Autocomplete, TextField, Stack } from "@mui/material";

type DropdownInputProps = {
    label: string;
    data: PickerData[];
    onChange: (value: any) => void;
};

const DropdownInput: FC<DropdownInputProps> = ({ label, data, onChange }) => {
    const options = transformToSelectOptions(data);
    return (
        <Stack direction="column" alignItems="center">
            <Stack direction="row">
                <h5>{label}:</h5>
            </Stack>
            <Stack direction="row">
                <Autocomplete
                    isOptionEqualToValue={(option, value) => option.label === value.label}
                    size={"small"}
                    options={options}
                    onChange={(event, value) => onChange(value!.label)}
                    renderInput={(params) => <TextField {...params} placeholder={label} />}
                />
            </Stack>
        </Stack>
    );
};

const transformToSelectOptions = (list: PickerData[]) => {
    return list.map((data) => {
        return { label: data.id };
    });
};

export default DropdownInput;
