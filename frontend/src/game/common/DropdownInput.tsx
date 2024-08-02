import React, { FC } from "react";
import { PickerData } from "react-simple-wheel-picker";
import { Col, Row } from "react-bootstrap";
import { Autocomplete, TextField } from "@mui/material";
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
                <Autocomplete
                    size={"small"}
                    options={options}
                    onChange={(event, value) => onChange(value!.label)}
                    renderInput={(params) => <TextField {...params} placeholder={label} />}
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
