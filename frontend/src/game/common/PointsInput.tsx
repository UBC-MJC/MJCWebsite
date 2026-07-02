import { PointWheelComponent } from "@/common/Utils";
import DropdownInput from "./DropdownInput";
import { Stack } from "@mui/material";

interface PointsInputProps {
    pointsWheel: PointWheelComponent[];
    onChange: (label: string, value: string) => void;
    /** Optional controlled values keyed by wheel `value` (e.g. `{ fu: "40" }`). */
    values?: Record<string, string>;
}

const PointsInput = ({ pointsWheel, onChange, values }: PointsInputProps) => {
    return (
        <Stack direction="row" spacing={2.5} justifyContent="center">
            {pointsWheel.map((wheel) => (
                <DropdownInput
                    key={wheel.value}
                    label={wheel.label}
                    data={wheel.data}
                    value={values?.[wheel.value]}
                    onChange={(value) => onChange(wheel.value, value)}
                />
            ))}
        </Stack>
    );
};
export default PointsInput;
