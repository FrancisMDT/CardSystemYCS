"use client";

import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Divider,
    Tabs,
    Tab,
    CircularProgress,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { useSeniorCardDataContext } from "@/app/Contexts/CardContext";
import QRCode from "react-qrcode-logo";
import FrontCard from "../components/FrontCard";
import BackCard from "../components/BackCard";

interface ViewSCModalProps {
    open: boolean;
    onClose: () => void;
}

export default function ViewSCModal({ open, onClose }: ViewSCModalProps) {
    const { selectedSCData } = useSeniorCardDataContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
    const [tabIndex, setTabIndex] = useState(0);

    const [loadingPhoto, setLoadingPhoto] = useState(true);
    const [loadingSignature, setLoadingSignature] = useState(true);

    useEffect(() => {
        if (!selectedSCData?.youthid) return;

        const fetchImageAsObjectUrl = async (baseUrl: string, exts: string[]) => {
            for (const ext of exts) {
                const url = `${baseUrl}.${ext}`;
                try {
                    const res = await fetch(url);
                    if (!res.ok) continue;
                    const blob = await res.blob();
                    return URL.createObjectURL(blob);
                } catch { }
            }
            return null;
        };

        const fetchImages = async () => {
            setLoadingPhoto(true);
            setLoadingSignature(true);

            const photo = await fetchImageAsObjectUrl(`/api/youthpics/Images/${selectedSCData.youthid}`, [
                "jpg",
                "jpeg",
                "png",
            ]);
            const sig = await fetchImageAsObjectUrl(`/api/youthpics/Signature/${selectedSCData.youthid}`, [
                "png",
                "jpg",
                "jpeg",
            ]);

            setPhotoUrl(photo);
            setSignatureUrl(sig);

            setLoadingPhoto(false);
            setLoadingSignature(false);
        };

        fetchImages();
    }, [selectedSCData]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setTabIndex(newValue);

    const detailItem = (label: string, value?: string) => (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="subtitle2" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="body1">{value || "-"}</Typography>
        </Box>
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: "background.default",
                    borderRadius: 3,
                    border: "1px solid rgba(0,0,0,0.1)",
                },
            }}
            BackdropProps={{
                sx: { backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" },
            }}
        >
            {/* Outer Box preserved for background styling */}
            <Box sx={{ bgcolor: "background.default", p: 2, borderRadius: 3 }}>
                <DialogTitle sx={{ fontWeight: "bold" }}>View Senior Card</DialogTitle>
                <Divider />

                <DialogContent sx={{ mt: 2 }}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: isMobile ? "column" : "row",
                            gap: 3,
                        }}
                    >
                        {/* Left: Details */}
                        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                            {detailItem("Youth ID", selectedSCData?.youthid)}
                            {detailItem("Full Name", selectedSCData?.fullName)}
                            {detailItem(
                                "Birthdate",
                                selectedSCData?.birthDate
                                    ? new Date(selectedSCData.birthDate).toLocaleDateString("en-US")
                                    : undefined
                            )}
                            {detailItem("Address", selectedSCData?.address)}
                            {detailItem("Affiliation", selectedSCData?.affiliates)}
                            {/* {detailItem("Contact Person", selectedSCData?.contactPerson)}
                            {detailItem("Contact Number", selectedSCData?.contactNum)}
                            {detailItem("Contact Address", selectedSCData?.contactAddress)} */}
                        </Box>

                        {/* Right: Card Tabs */}
                        <Box sx={{ flex: 1, mt: isMobile ? 2 : 0 }}>
                            <Tabs
                                value={tabIndex}
                                onChange={handleTabChange}
                                variant="fullWidth"
                                textColor="secondary"
                                indicatorColor="secondary"
                            >
                                <Tab label="Front" />
                                <Tab label="Back" />
                            </Tabs>

                            {/* Keep your card layout exactly as-is */}
                            <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                                    <Box sx={{ borderRadius: 3, overflow: "auto" }}>
                                        {tabIndex === 0 ? (

                                            <FrontCard
                                                selectedSCData={selectedSCData}
                                                photoUrl={photoUrl}
                                                loadingPhoto={loadingPhoto}
                                                operation="view"
                                                signatureUrl={signatureUrl}
                                                loadingSignature={loadingSignature}
                                            />

                                        ) : (

                                            <BackCard
                                                selectedSCData={selectedSCData}
                                                signatureUrl={signatureUrl}
                                                loadingSignature={loadingSignature}
                                                operation="view"
                                            />

                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ justifyContent: "center", mt: 2 }}>
                    <Button variant="contained" color="secondary" onClick={onClose}>
                        Close
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
