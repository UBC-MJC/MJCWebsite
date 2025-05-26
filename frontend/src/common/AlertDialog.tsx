import React, { FC } from "react";
import PropTypes from "prop-types";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { confirmable, createConfirmation } from "react-confirm";

const Alert: FC<any> = ({
    show,
    proceed,
    dismiss,
    cancel,
    confirmation,
    title,
    okText,
    okButtonStyle,
    ...options
}) => {
    return (
        <Dialog open={!!show} onClose={() => proceed()} fullWidth maxWidth="xs">
            {title && <DialogTitle>{title}</DialogTitle>}
            <DialogContent>{confirmation}</DialogContent>
            <DialogActions>
                <Button
                    variant={okButtonStyle === "text" ? "text" : "contained"}
                    color={
                        okButtonStyle === "primary" ||
                        okButtonStyle === "secondary" ||
                        okButtonStyle === "error" ||
                        okButtonStyle === "info" ||
                        okButtonStyle === "success" ||
                        okButtonStyle === "warning"
                            ? okButtonStyle
                            : "primary"
                    }
                    onClick={() => proceed()}
                >
                    {okText}
                </Button>
            </DialogActions>
        </Dialog>
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
        "error",
        "warning",
        "info",
        "text",
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

const alertLow = createConfirmation(confirmable(Alert));

const alert = (message: any, options = {}) => {
    return alertLow(Object.assign({ confirmation: message }, options));
};

export default alert;
