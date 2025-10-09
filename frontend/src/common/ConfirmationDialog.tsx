import React, { FC } from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import { confirmable, createConfirmation } from "react-confirm";
import { Button } from "@mui/material";

type ButtonVariant =
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "light"
    | "dark"
    | "link";

interface ConfirmationDialogProps {
    show?: boolean;
    proceed?: (result: boolean) => void;
    cancel?: () => void;
    dismiss?: () => void;
    confirmation?: string;
    title?: string;
    okText?: string;
    cancelText?: string;
    okButtonStyle?: ButtonVariant;
    cancelButtonStyle?: ButtonVariant;
}

const ConfirmationDialog: FC<ConfirmationDialogProps> = ({
    show,
    proceed,
    confirmation,
    title,
    okText,
    cancelText,
}) => {
    const header = title ? (
        <Modal.Header>
            <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
    ) : undefined;
    return (
        <Modal size="sm" show={show} onHide={() => proceed?.(false)} backdrop="static" centered>
            {header}
            <Modal.Body>{confirmation}</Modal.Body>
            <Modal.Footer>
                <Button onClick={() => proceed?.(false)}>{cancelText}</Button>
                <Button onClick={() => proceed?.(true)}>{okText}</Button>
            </Modal.Footer>
        </Modal>
    );
};

ConfirmationDialog.propTypes = {
    /** header title */
    title: PropTypes.string,
    confirmation: PropTypes.string, // arguments of your confirm function
    okText: PropTypes.string,
    cancelText: PropTypes.string,
    okButtonStyle: PropTypes.oneOf([
        "primary",
        "secondary",
        "success",
        "danger",
        "warning",
        "info",
        "light",
        "dark",
        "link",
    ]),
    cancelButtonStyle: PropTypes.oneOf([
        "primary",
        "secondary",
        "success",
        "danger",
        "warning",
        "info",
        "light",
        "dark",
        "link",
    ]),
    show: PropTypes.bool, // from confirmable.
    proceed: PropTypes.func, // from confirmable.
    cancel: PropTypes.func, // from confirmable.
    dismiss: PropTypes.func, // from confirmable.
};

ConfirmationDialog.defaultProps = {
    title: undefined,
    confirmation: undefined,
    okText: "OK",
    cancelText: "Cancel",
    okButtonStyle: "primary",
    cancelButtonStyle: "secondary",
    show: undefined,
    proceed: undefined,
    cancel: undefined,
    dismiss: undefined,
};

// @ts-expect-error - react-confirm types are incompatible with FC
const confirmLow = createConfirmation(confirmable(ConfirmationDialog));

const confirmDialog = (message: string, options: Partial<ConfirmationDialogProps> = {}) => {
    return confirmLow(Object.assign({ confirmation: message }, options));
};

export default confirmDialog;
