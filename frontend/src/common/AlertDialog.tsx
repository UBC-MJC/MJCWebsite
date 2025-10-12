import React, { FC } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Button,
} from "@mui/material";
import { confirmable, createConfirmation } from "react-confirm";

type ButtonVariant = "primary" | "secondary" | "success" | "error" | "warning" | "info";

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
    show = false,
    proceed,
    dismiss: _dismiss,
    cancel: _cancel,
    confirmation,
    title,
    okText = "OK",
    okButtonStyle = "primary",
    ..._options
}) => {
    return (
        <Dialog
            open={show}
            onClose={() => proceed?.()}
            maxWidth="xs"
            fullWidth
            disableEscapeKeyDown={false}
            PaperProps={{
                sx: {
                    bgcolor: "background.paper",
                    backgroundImage: "none",
                },
            }}
        >
            {title && <DialogTitle sx={{ color: "text.primary" }}>{title}</DialogTitle>}
            <DialogContent>
                <DialogContentText sx={{ color: "text.primary" }}>{confirmation}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    color={okButtonStyle}
                    onClick={() => proceed?.()}
                    autoFocus
                >
                    {okText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// @ts-expect-error - react-confirm types are incompatible with FC
const alertLow = createConfirmation(confirmable(Alert));

const alert = (message: string, options: Partial<AlertProps> = {}) => {
    return alertLow(Object.assign({ confirmation: message }, options));
};

export default alert;
