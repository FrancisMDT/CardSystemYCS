"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Divider,
    Slider,
} from "@mui/material";
import Cropper, { Area } from "react-easy-crop";
import { useFaceDetection } from "react-use-face-detection";
import getCroppedImg from "@/utils/cropImage";
import { useStateContext } from "../../../../Contexts/stateContext";
import AddIcon from "@mui/icons-material/Add";

interface CropProps {
    fullwidth?: boolean;
}

export default function FaceCropModal({ fullwidth = false }: CropProps) {
    const [open, setOpen] = useState(false);
    const [image, setImage] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const { faces } = useFaceDetection() as unknown as { faces: any[] };
    const { captured, setCaptured } = useStateContext();

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImage(URL.createObjectURL(file));
    };

    useEffect(() => {
        if (faces && faces.length > 0 && croppedAreaPixels === null) {
            const face = faces[0]?.box;
            if (face) {
                setCrop({ x: face.left, y: face.top });
                setZoom(1.5);
            }
        }
    }, [faces, croppedAreaPixels]);

    const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
        setCroppedAreaPixels(areaPixels);
    }, []);

    const handleConfirm = async () => {
        if (!image || !croppedAreaPixels) return;
        const croppedImage = await getCroppedImg(image, croppedAreaPixels);
        setCaptured(croppedImage);
        handleClose();
    };

    const handleClear = () => {
        setImage(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    };

    const handleOpen = () => {
        setImage(captured || null);
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

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
                Add Picture
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
                <DialogTitle sx={{ textAlign: "center" }}>Add Picture</DialogTitle>

                <DialogContent
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        alignItems: "center",
                    }}
                >
                    {/* File Upload */}
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <Button variant="contained" component="label" sx={{ mb: 1 }}>
                            Browse
                            <input type="file" accept="image/*" hidden onChange={handleFile} />
                        </Button>
                        <Typography variant="caption" color="text.secondary" textAlign="center">
                            Select an image to upload for cropping.
                        </Typography>
                    </Box>

                    {/* Cropper */}
                    {image && (
                        <Box
                            sx={{
                                position: "relative",
                                width: "100%",
                                height: 300,
                                borderRadius: 2,
                                overflow: "hidden",
                                bgcolor: "#333",
                            }}
                        >
                            <Cropper
                                image={image}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                cropShape="rect"
                                showGrid={false}
                                minZoom={1}
                                maxZoom={3}
                                zoomSpeed={0.1}
                            />
                        </Box>
                    )}

                    {/* Zoom Slider */}
                    {image && (
                        <Slider
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.01}
                            onChange={(e, value) => setZoom(value as number)}
                        />
                    )}
                </DialogContent>

                {/* Actions */}
                {image && (
                    <DialogActions sx={{ gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <Button variant="outlined" color="secondary" onClick={handleClear}>
                            Clear
                        </Button>
                        <Button variant="contained" color="primary" onClick={handleConfirm}>
                            Confirm
                        </Button>
                    </DialogActions>
                )}
                </Box>
            </Dialog>
        </>
    );
}
