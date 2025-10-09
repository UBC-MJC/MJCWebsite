import React, { FC } from "react";
import PropTypes from "prop-types";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Button,
} from "@mui/material";
import { confirmable, createConfirmation } from "react-confirm";

type ButtonVariant =
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "warning"
    | "info";

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
    okButtonStyle,
    cancelButtonStyle,
}) => {
    return (
        <Dialog open={show || false} onClose={() => proceed?.(false)} maxWidth="xs" fullWidth>
            {title && <DialogTitle>{title}</DialogTitle>}
            <DialogContent>
                <DialogContentText>{confirmation}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="outlined"
                    color={cancelButtonStyle}
                    onClick={() => proceed?.(false)}
                >
                    {cancelText}
                </Button>
                <Button
                    variant="contained"
                    color={okButtonStyle}
                    onClick={() => proceed?.(true)}
                    autoFocus
                >
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
    okButtonStyle: PropTypes.oneOf([
        "primary",
        "secondary",
        "success",
        "error",
        "warning",
        "info",
    ]),
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

// @ts-expect-error - react-confirm types are incompatible with FC
const confirmLow = createConfirmation(confirmable(ConfirmationDialog));

const confirmDialog = (message: string, options: Partial<ConfirmationDialogProps> = {}) => {
    return confirmLow(Object.assign({ confirmation: message }, options));
};

export default confirmDialog;
