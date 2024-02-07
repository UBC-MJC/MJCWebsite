import { FC } from "react";
import { PickerData } from "react-simple-wheel-picker";
import Select from "react-select";
import { Col, Row } from "react-bootstrap";

type DropdownInputProps = {
    label: string;
    data: PickerData[];
    onChange: (value: any) => void;
};

const DropdownInput: FC<DropdownInputProps> = ({ label, data, onChange }) => {
    return (
        <Col style={{ maxWidth: "200px" }}>
            <Row>
                <h6>{label}:</h6>
            </Row>
            <Row className="text-start">
                <Select
                    options={transformToSelectOptions(data)}
                    isSearchable={false}
                    placeholder={label}
                    getOptionValue={(selectOptions) => selectOptions.label}
                    onChange={(selectedOption) => onChange(selectedOption!.label)}
                />
            </Row>
        </Col>
    );
};

const transformToSelectOptions = (list: PickerData[]) => {
    return list.map((data) => {
        return { label: data.id };
    });
};

export default DropdownInput;
