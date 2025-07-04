import React, { FC } from "react";
import Stack from "@mui/material/Stack";
import { PointWheelComponent } from "../../common/Utils";
import DropdownInput from "./DropdownInput";

type PointsInputProps = {
    pointsWheel: PointWheelComponent[];
    onChange: (label: string, value: number) => void;
};

const PointsInput: FC<PointsInputProps> = ({ pointsWheel, onChange }) => {
    return (
        <div>
        <div>Hand:</div>
        <Stack direction="row" alignItems="center" spacing={2}>
            {pointsWheel.map((wheel) => (
                <DropdownInput
                    key={wheel.value}
                    label={wheel.label}
                    data={wheel.data}
                    onChange={(value) => onChange(wheel.value, value)}
                />
            ))}
        </Stack>
        </div>
    );
};
export default PointsInput;
