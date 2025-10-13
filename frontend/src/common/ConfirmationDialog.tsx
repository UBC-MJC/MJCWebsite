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

const ConfirmationDialog = ({
    show = false,
    proceed,
    confirmation,
    title,
    okText = "OK",
    cancelText = "Cancel",
    okButtonStyle = "primary",
    cancelButtonStyle = "secondary",
}: ConfirmationDialogProps) => {
    return (
        <Dialog
            open={show}
            onClose={() => proceed?.(false)}
            maxWidth="xs"
            fullWidth
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

const confirmLow = createConfirmation(confirmable(ConfirmationDialog));

const confirmDialog = (message: string, options: Partial<ConfirmationDialogProps> = {}) => {
    return confirmLow(Object.assign({ confirmation: message }, options));
};

export default confirmDialog;
