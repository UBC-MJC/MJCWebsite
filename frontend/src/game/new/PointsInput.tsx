import React, { FC } from "react";
import { getPointWheels } from "../../common/Utils";
import CustomizedWheelPicker from "./CustomizedWheelPicker";
import { PickerData } from "react-simple-wheel-picker";

type PointsInputProps = {
    gameVariant: GameVariant;
    pointsValue: any;
    onChange: (value: any) => void;
    isLegacy?: boolean;
};

const NewPointsInput: FC<PointsInputProps> = ({ gameVariant, onChange }) => {
    const handleOnChange = (target: PickerData, label: string) => {
        // handleOnChange
    };

    return (
        <div className="d-flex justify-content-center mt-4 wheel-picker-container">
            {getPointWheels(gameVariant).map((wheel, idx) => (
                <div key={wheel.label}>
                    <h5>{wheel.label}</h5>
                    <CustomizedWheelPicker
                        data={wheel.data}
                        onChange={(target) => handleOnChange(target, wheel.label)}
                    />
                </div>
            ))}
        </div>
    );
};
