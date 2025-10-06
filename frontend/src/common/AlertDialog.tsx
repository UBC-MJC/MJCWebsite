import React, { FC } from "react";
import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";
import { confirmable, createConfirmation } from "react-confirm";

type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark" | "link";

interface AlertProps {
    show?: boolean;
    proceed?: () => void;
    dismiss?: () => void;
    cancel?: () => void;
    confirmation?: string;
    title?: string;
    okText?: string;
    okButtonStyle?: ButtonVariant;
}

const Alert: FC<AlertProps> = ({
    show,
    proceed,
    dismiss: _dismiss,
    cancel: _cancel,
    confirmation,
    title,
    okText,
    okButtonStyle,
    ..._options
}) => {
    const header = title ? (
        <Modal.Header>
            <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
    ) : undefined;
    return (
        <Modal
            size="sm"
            show={show}
            onHide={() => proceed?.()}
            keyboard={true}
            backdrop="static"
            centered
        >
            {header}
            <Modal.Body>{confirmation}</Modal.Body>
            <Modal.Footer>
                <Button variant={okButtonStyle} onClick={() => proceed?.()}>
                    {okText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

Alert.propTypes = {
    /** header title */
    title: PropTypes.string,
    confirmation: PropTypes.string, // arguments of your confirm function
    okText: PropTypes.string,
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
    show: PropTypes.bool, // from confirmable.
    proceed: PropTypes.func, // from confirmable.
    cancel: PropTypes.func, // from confirmable.
    dismiss: PropTypes.func, // from confirmable.
};

Alert.defaultProps = {
    title: undefined,
    confirmation: undefined,
    okText: "OK",
    okButtonStyle: "primary",
    show: undefined,
    proceed: undefined,
    cancel: undefined,
    dismiss: undefined,
};

// @ts-expect-error - react-confirm types are incompatible with FC
const alertLow = createConfirmation(confirmable(Alert));

const alert = (message: string, options: Partial<AlertProps> = {}) => {
    return alertLow(Object.assign({ confirmation: message }, options));
};

export default alert;
