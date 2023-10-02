import { FC } from "react";
import { PickerData } from "react-simple-wheel-picker";
import { getPointWheels } from "../../common/Utils";
import Select from "react-select";

type PointsInputProps = {
    gameVariant: GameVariant;
    pointsValue: any;
    onChange: (value: any) => void;
    isLegacy?: boolean;
};

const LegacyPointsInput: FC<PointsInputProps> = ({ gameVariant, pointsValue, onChange }) => {
    const transformToSelectOptions = (list: PickerData[]) => {
        return list.map((data) => {
            return { label: data.id };
        });
    };

    const pointsOnChange = (wheel: any, label: string) => {
        const newPointsValue = { ...pointsValue };
        newPointsValue[wheel.value] = +label;

        onChange(newPointsValue);
    };

    return (
        <>
            {getPointWheels(gameVariant).map((wheel, idx) => (
                <div
                    key={wheel.label}
                    className="d-flex justify-content-center align-items-center mt-4"
                >
                    <h5 className="mx-2 my-0">{wheel.label}:</h5>
                    <div style={{ width: "200px" }} className="text-start">
                        <Select
                            options={transformToSelectOptions(wheel.data)}
                            isSearchable
                            placeholder={"Select " + wheel.label}
                            getOptionValue={(selectOptions) => selectOptions.label}
                            onChange={(selectedOption) =>
                                pointsOnChange(wheel, selectedOption!.label)
                            }
                        />
                    </div>
                </div>
            ))}
        </>
    );
};

export default LegacyPointsInput;
