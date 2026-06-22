import { PointWheelComponent } from "@/common/Utils";
import DropdownInput from "./DropdownInput";
import { Stack, Typography } from "@mui/material";

interface PointsInputProps {
    pointsWheel: PointWheelComponent[];
    onChange: (label: string, value: string) => void;
    /** Optional controlled values keyed by wheel `value` (e.g. `{ fu: "40" }`). */
    values?: Record<string, string>;
}

const PointsInput = ({ pointsWheel, onChange, values }: PointsInputProps) => {
    return (
        <Stack spacing={2.5} alignItems="center">
            <Typography variant="h3" component="h5">
                Hand
            </Typography>
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
        </Stack>
    );
};
export default PointsInput;
