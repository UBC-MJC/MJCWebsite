import React, { FC } from "react";
import { Row } from "react-bootstrap";
import { PointWheelComponent } from "../../common/Utils";
import DropdownInput from "./DropdownInput";

type PointsInputProps = {
    pointsWheel: PointWheelComponent[];
    onChange: (label: string, value: number) => void;
};

const PointsInput: FC<PointsInputProps> = ({ pointsWheel, onChange }) => {
    return (
        <Row >
            <h5>Hand:</h5>
            {pointsWheel.map((wheel) => (
                <DropdownInput
                    key={wheel.value}
                    label={wheel.label}
                    data={wheel.data}
                    onChange={(value) => onChange(wheel.value, value)}
                />
            ))}
        </Row>
    );
};
export default PointsInput;
