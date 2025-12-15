"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    Box,
    Button,
    Modal,
    Typography,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from "@mui/material";
import dynamic from "next/dynamic";
import type { WebcamProps } from "react-webcam";
import { useStateContext } from "../../../../Contexts/stateContext";

// Dynamic import with forwardRef for TypeScript
const Webcam = dynamic(
    () =>
        import("react-webcam").then((mod) =>
            React.forwardRef<any, WebcamProps>((props, ref) => (
                <mod.default {...props} ref={ref} />
            ))
        ),
    { ssr: false }
);

export function CapturePicture() {
    const [open, setOpen] = useState(false);
    const [cameraId, setCameraId] = useState<string | undefined>(undefined);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const webcamRef = useRef<any>(null);

    const { captured, setCaptured } = useStateContext();

    // Detect mobile
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    const handleOpen = async () => {
        setOpen(true);
        setPermissionError(null);

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setPermissionError("Camera not supported on this device/browser.");
            return;
        }

        try {
            // Request permission first
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach((track) => track.stop());

            // Enumerate devices
            const cams = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = cams.filter((d) => d.kind === "videoinput");

            setDevices(videoDevices);

            if (videoDevices.length > 0) setCameraId(videoDevices[0].deviceId);
        } catch (err) {
            console.error(err);
            setPermissionError(
                "Camera access denied or not available on this device."
            );
        }
    };

    const handleClose = () => setOpen(false);

    const capture = () => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) setCaptured(imageSrc);
        }
    };

    // Choose constraints dynamically
    const videoConstraints = cameraId
        ? { deviceId: { exact: cameraId }, width: 200, height: 200 }
        : isMobile
            ? { facingMode: "user", width: 200, height: 200 }
            : { width: 200, height: 200 };

    return (
        <div>
            <Button variant="contained" onClick={handleOpen}>
                Add Picture
            </Button>

            <Modal open={open} onClose={handleClose}>
                <Box
                    sx={{
                        position: "absolute" as const,
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 3,
                        display: "flex",
                        gap: 3,
                        flexWrap: "wrap",
                    }}
                >
                    {/* Camera + controls */}
                    <Box display="flex" flexDirection="column" alignItems="center">
                        {permissionError ? (
                            <Typography color="error" textAlign="center">
                                {permissionError}
                            </Typography>
                        ) : (
                            <>
                                {devices.length > 0 && !isMobile && (
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel>Camera</InputLabel>
                                        <Select
                                            value={cameraId || ""}
                                            label="Camera"
                                            onChange={(e) => setCameraId(e.target.value)}
                                        >
                                            {devices.map((d) => (
                                                <MenuItem key={d.deviceId} value={d.deviceId}>
                                                    {d.label || `Camera ${d.deviceId}`}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}

                                <Box
                                    sx={{
                                        width: 200,
                                        height: 200,
                                        border: "1px solid #ccc",
                                        overflow: "hidden",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/png"
                                        screenshotQuality={1}
                                        imageSmoothing={true}
                                        onUserMediaError={(err) => console.error(err)}
                                        videoConstraints={videoConstraints}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                        }}
                                        mirrored
                                        forceScreenshotSourceSize
                                        disablePictureInPicture
                                        onUserMedia={(e) => console.log(e)}
                                    />
                                </Box>

                                <Button variant="contained" sx={{ mt: 2 }} onClick={capture}>
                                    Capture
                                </Button>
                            </>
                        )}
                    </Box>

                    {/* Preview */}
                    <Box display="flex" flexDirection="column" alignItems="center">
                        <Typography variant="subtitle1">Preview</Typography>
                        <Box
                            sx={{
                                width: 200,
                                height: 200,
                                border: "1px solid #ccc",
                                mt: 1,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                overflow: "hidden",
                                bgcolor: "#f0f0f0",
                            }}
                        >
                            {captured ? (
                                <img
                                    src={captured}
                                    alt="Captured"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            ) : (
                                <Typography variant="caption">No picture yet</Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
}
