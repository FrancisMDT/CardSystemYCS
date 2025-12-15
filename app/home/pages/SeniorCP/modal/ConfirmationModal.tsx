// components/ConfirmationModal.tsx
"use client";

import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from "@mui/material";
import { on } from "events";

interface ConfirmationModalProps {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    open,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
}) => {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            maxWidth="md"
            PaperProps={{
                sx: {
                    bgcolor: "background.default", // exact theme color
                    borderRadius: 3,
                    boxShadow: "none",             // remove shadow/overlay
                    border: "1px solid rgba(0,0,0,0.1)",
                },
            }}
            BackdropProps={{
                sx: {
                    backgroundColor: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(4px)",
                },
            }}
        >
            <Box sx={{ bgcolor: "background.default" }}>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <Typography>{message}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" color="inherit" onClick={onCancel}>
                        {cancelText}
                    </Button>
                    <Button variant="contained" color="primary" onClick={onConfirm}>
                        {confirmText}
                    </Button>
                </DialogActions></Box>
        </Dialog>
    );
};
