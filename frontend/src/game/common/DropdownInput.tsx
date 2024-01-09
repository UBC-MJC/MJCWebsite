import { FC } from "react";
import { PickerData } from "react-simple-wheel-picker";
import Select from "react-select";

type DropdownInputProps = {
    label: string;
    data: PickerData[];
    onChange: (value: any) => void;
};

const DropdownInput: FC<DropdownInputProps> = ({ label, data, onChange }) => {
    return (
        <div className="d-flex justify-content-center align-items-center mb-4">
            <h5 className="mx-2 my-0">{label}:</h5>
            <div style={{ width: "200px" }} className="text-start">
                <Select
                    options={transformToSelectOptions(data)}
                    isSearchable
                    placeholder={"Select " + label}
                    getOptionValue={(selectOptions) => selectOptions.label}
                    onChange={(selectedOption) =>
                        onChange(selectedOption!.label)
                    }
                />
            </div>
        </div>
    );
};

const transformToSelectOptions = (list: PickerData[]) => {
    return list.map((data) => {
        return { label: data.id };
    });
};

export default DropdownInput;
