import React, { FC } from "react";
import { PickerData } from "react-simple-wheel-picker";
import { Col, Row } from "react-bootstrap";
import Form from "react-bootstrap/Form";
type DropdownInputProps = {
    label: string;
    data: PickerData[];
    onChange: (value: any) => void;
};

const DropdownInput: FC<DropdownInputProps> = ({ label, data, onChange }) => {
    const options = transformToSelectOptions(data);
    return (
        <Col style={{ maxWidth: "200px" }} className={"mx-2"}>
            <Row>
                <h6>{label}:</h6>
            </Row>
            <Row className="text-start">
                <Form.Select onChange={(e) => onChange(e.target.value)}>
                    <option value="" selected disabled hidden>
                        {label}
                    </option>
                    {options.map((option, idx) => {
                        return (
                            <option key={idx} value={option.label}>
                                {option.label}
                            </option>
                        );
                    })}
                </Form.Select>
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
