import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    Box,
} from "@mui/material";

interface ConfirmationModalProps {
    open: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    open,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
}) => {
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth >
            <Box sx={{ bgcolor: "background.default " }}>
            <DialogTitle>Confirmation</DialogTitle>

            <DialogContent>
                <Typography align="center">{message}</Typography>
            </DialogContent>

            <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
                <Button variant="outlined" color="inherit" onClick={onCancel}>
                    {cancelText}
                </Button>
                <Button variant="contained" color="error" onClick={onConfirm}>
                    {confirmText}
                </Button>
            </DialogActions>
            </Box>
        </Dialog>
    );
};

export default ConfirmationModal;
