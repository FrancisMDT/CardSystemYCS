"use client";

import React, { useState } from "react";
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Divider } from "@mui/material";
import { useStateContext } from "@/app/Contexts/stateContext";
import AddIcon from "@mui/icons-material/Add";

interface SignatureUploadProps {
    fullwidth?: boolean;
}

export function SignatureUpload({ fullwidth = false }: SignatureUploadProps) {
    const [open, setOpen] = useState(false);
    const { signature, setSignature } = useStateContext();

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) setSignature(e.target.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleClear = () => setSignature(null);
    const handleConfirm = () => handleClose();

    return (
        <>
            <Button
                fullWidth={fullwidth}
                size="small"
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}
                onClick={handleOpen}
            >
                Add Signature
            </Button>

            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, boxShadow: 6, border: "1px solid rgba(0,0,0,0.1)" },
                }}
                BackdropProps={{ sx: { backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" } }}
            >
                <Box sx={{ bgcolor: "background.default", p: 3, borderRadius: 3 }}>
                    <DialogTitle sx={{ textAlign: "center" }}>Add Signature</DialogTitle>

                    <DialogContent
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            gap: 3,
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        {/* Browse */}
                        <Box display="flex" flexDirection="column" alignItems="center" flex={1}>
                            <Button variant="contained" component="label" sx={{ mb: 2 }}>
                                Browse
                                <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                            </Button>
                            <Typography variant="caption" color="text.secondary" textAlign="center">
                                Select an image file to upload your signature.
                            </Typography>
                        </Box>

                        <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />

                        {/* Preview */}
                        <Box display="flex" flexDirection="column" alignItems="center" flex={1}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                Preview
                            </Typography>
                            <Box
                                sx={{
                                    width: { xs: "100%", md: 200 },
                                    height: 100,
                                    border: "1px solid #ccc",
                                    borderRadius: 2,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    overflow: "hidden",
                                    bgcolor: "#f9f9f9",
                                    mb: 2,
                                }}
                            >
                                {signature ? (
                                    <img
                                        src={signature}
                                        alt="Signature"
                                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                    />
                                ) : (
                                    <Typography variant="caption" color="text.secondary">
                                        No signature yet
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </DialogContent>

                    {/* Actions */}
                    <DialogActions sx={{ gap: 1, flexWrap: "wrap" }}>
                        <Button variant="outlined" color="secondary" onClick={handleClear}>
                            Clear
                        </Button>
                        <Button variant="contained" color="primary" onClick={handleConfirm}>
                            Confirm
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </>
    );
}
