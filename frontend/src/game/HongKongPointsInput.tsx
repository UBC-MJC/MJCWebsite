import {FC} from "react";
import {PickerData} from "react-simple-wheel-picker";
import CustomizedWheelPicker from "./CustomizedWheelPicker";
import {hongKongPoints} from "../common/Utils";

const HongKongPointsInput: FC = () => {
    const handleOnChange = (target: PickerData) => {
        console.log(target);
    };

    return (
        <div>
            <h5>Points</h5>
            <CustomizedWheelPicker data={hongKongPoints} onChange={handleOnChange} />
        </div>
    )
}

export default HongKongPointsInput
