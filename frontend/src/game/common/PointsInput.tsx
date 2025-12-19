import { PointWheelComponent } from "@/common/Utils";
import DropdownInput from "./DropdownInput";
import { Stack, Typography } from "@mui/material";

interface PointsInputProps {
    pointsWheel: PointWheelComponent[];
    onChange: (label: string, value: string) => void;
}

const PointsInput = ({ pointsWheel, onChange }: PointsInputProps) => {
    return (
        <Stack spacing={2} alignItems="center">
            <Typography variant="h3" component="h5">
                Hand:
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
                {pointsWheel.map((wheel) => (
                    <DropdownInput
                        key={wheel.value}
                        label={wheel.label}
                        data={wheel.data}
                        onChange={(value) => onChange(wheel.value, value)}
                    />
                ))}
            </Stack>
        </Stack>
    );
};
export default PointsInput;
