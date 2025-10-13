import { japanesePointsWheel } from "@/common/Utils";
import CustomizedWheelPicker from "./CustomizedWheelPicker";
import { PickerData } from "react-simple-wheel-picker";
import type { GameVariant, JapaneseHandInput, HongKongHandInput } from "@/types";

interface PointsInputProps {
    gameVariant: GameVariant;
    pointsValue: JapaneseHandInput | HongKongHandInput;
    onChange: (value: JapaneseHandInput | HongKongHandInput) => void;
    isLegacy?: boolean;
}

export const NewPointsInput = ({
    gameVariant: _gameVariant,
    onChange: _onChange,
    pointsValue: _pointsValue,
    isLegacy: _isLegacy = false,
}: PointsInputProps) => {
    const handleOnChange = (_target: PickerData, _label: string) => {
        // handleOnChange
    };

    return (
        <div className="d-flex justify-content-center mt-4 wheel-picker-container">
            {japanesePointsWheel.map((wheel, _idx) => (
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
