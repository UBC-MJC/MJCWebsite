import { FC } from "react";
import WheelPicker, { PickerData } from "react-simple-wheel-picker";

type CustomizedWheelPickerProps = {
    data: PickerData[];
    onChange: (item: PickerData) => void;
};

const CustomizedWheelPicker: FC<CustomizedWheelPickerProps> = ({ data, onChange }) => {
    return (
        <WheelPicker
            data={data}
            onChange={onChange}
            height={150}
            width={110}
            itemHeight={30}
            fontSize={20}
            selectedID={data[0].id}
            color="#ccc"
            activeColor="#333"
            backgroundColor="#fff"
            shadowColor="#dbdbdb"
        />
    );
};

export default CustomizedWheelPicker;
