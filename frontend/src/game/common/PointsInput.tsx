import React, { FC } from "react";
import { PointWheelComponent } from "../../common/Utils";
import DropdownInput from "./DropdownInput";
import { Stack } from "@mui/material";

interface PointsInputProps {
    pointsWheel: PointWheelComponent[];
    onChange: (label: string, value: number) => void;
}

const PointsInput: FC<PointsInputProps> = ({ pointsWheel, onChange }) => {
    return (
        <>
            <h5>Hand:</h5>
            <Stack direction="row" spacing={1}>
                {pointsWheel.map((wheel) => (
                    <DropdownInput
                        key={wheel.value}
                        label={wheel.label}
                        data={wheel.data}
                        onChange={(value) => onChange(wheel.value, value)}
                    />
                ))}
            </Stack>
        </>
    );
};
export default PointsInput;
