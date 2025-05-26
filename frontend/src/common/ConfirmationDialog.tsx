import React, { FC } from "react";
import PropTypes from "prop-types";
import { confirmable, createConfirmation } from "react-confirm";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from "@mui/material";

const ConfirmationDialog: FC<any> = ({
    show,
    proceed,
    dismiss,
    cancel,
    confirmation,
    title,
    okText,
    cancelText,
    okButtonStyle,
    cancelButtonStyle,
    ...options
}) => {
    return (
        <Dialog open={show} onClose={() => proceed(false)} fullWidth maxWidth="xs">
            {title && <DialogTitle>{title}</DialogTitle>}
            <DialogContent>
                <Typography>{confirmation}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => proceed(false)} color={cancelButtonStyle} variant="outlined">
                    {cancelText}
                </Button>
                <Button onClick={() => proceed(true)} color={okButtonStyle} variant="contained">
                    {okText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

ConfirmationDialog.propTypes = {
    /** header title */
    title: PropTypes.string,
    confirmation: PropTypes.string, // arguments of your confirm function
    okText: PropTypes.string,
    cancelText: PropTypes.string,
    okButtonStyle: PropTypes.oneOf(["primary", "secondary", "success", "error", "warning", "info"]),
    cancelButtonStyle: PropTypes.oneOf([
        "primary",
        "secondary",
        "success",
        "error",
        "warning",
        "info",
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

const confirmLow = createConfirmation(confirmable(ConfirmationDialog));

const confirmDialog = (message: any, options = {}) => {
    return confirmLow(Object.assign({ confirmation: message }, options));
};

export default confirmDialog;
