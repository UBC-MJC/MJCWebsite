import {FC} from "react";
import {PickerData} from "react-simple-wheel-picker";
import CustomizedWheelPicker from "./CustomizedWheelPicker";
import {japaneseDora, japaneseFu, japanesePoints} from "../common/Utils";

const JapanesePointsInput: FC = () => {
    const handleOnChange = (target: PickerData) => {
        console.log(typeof target.value);
    };

    return (
        <>
            <div>
                <h5>Fu</h5>
                <CustomizedWheelPicker data={japaneseFu} onChange={handleOnChange} />
            </div>
            <div>
                <h5>Points</h5>
                <CustomizedWheelPicker data={japanesePoints} onChange={handleOnChange} />
            </div>
            <div>
                <h5>Dora</h5>
                <CustomizedWheelPicker data={japaneseDora} onChange={handleOnChange} />
            </div>
        </>
    )
}

export default JapanesePointsInput
