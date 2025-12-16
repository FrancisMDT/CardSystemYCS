"use client";

import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import QRCode from "react-qrcode-logo";
import { YouthCardModel } from "@/app/models/SeniorCard/youthCardModel";

interface FrontCardProps {
    selectedSCData: Partial<YouthCardModel> | null;
    photoUrl: string | null;
    loadingPhoto?: boolean;
    operation?: "view" | "print";
    signatureUrl: string | null,
    loadingSignature: boolean,
}

export default function FrontCard({
    selectedSCData,
    photoUrl,
    loadingPhoto,
    operation = "view",
    signatureUrl,
    loadingSignature,
}: FrontCardProps) {
    const isPrint = operation === "print";

    return (
        <Box
            className="print-page"
            sx={{
                position: isPrint ? "absolute" : "relative",
                left: 0,
                top: 0,
                opacity: isPrint ? 0 : 1,
                pointerEvents: isPrint ? "none" : "auto",
                width: 430,
                height: 271,
                bgcolor: "#FFF",
                overflow: "hidden",
                "@media print": {
                    position: "absolute",
                    opacity: 1,
                    pointerEvents: "auto",
                },
            }}
        >
            <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
                {/* Photo */}
                <Box
                    sx={{
                        position: "absolute",
                        top: 72,
                        left: 26,
                        width: 134,
                        height: 134,
                        overflow: "hidden",
                        zIndex: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {loadingPhoto ? (
                        <CircularProgress />
                    ) : photoUrl ? (
                        <img
                            src={photoUrl}
                            alt="Captured"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        <Typography>No Image</Typography>
                    )}
                </Box>

                <Box
                    sx={{
                        position: "absolute",
                        bottom: 20,
                        left: 40,
                        width: 250,
                        height: 23,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        zIndex: 2,
                    }}
                >
                    <Typography
                        color="white"
                        sx={{
                            fontSize: "8pt",
                            lineHeight: 1,
                            textAlign: "left",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            overflow: "hidden",
                        }}
                    >
                        {selectedSCData?.youthid}
                    </Typography>
                </Box>

                {/* Background */}
                <Box sx={{ position: "absolute", top: -1, left: 0, width: "100%", height: "100%", zIndex: 1}}>
                    <img
                        src="/youthid_front.png"
                        alt="Background"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                </Box>

                {/* QR Code */}
                <Box sx={{ position: "absolute", top: 32, right: 7, zIndex: 2 }}>
                    <QRCode
                        value={selectedSCData?.youthid}
                        size={148}
                        bgColor="#FFFFFF00"
                        style={{ maxWidth: "100%", width: "83px", height: "auto" }}
                        removeQrCodeBehindLogo
                        qrStyle="squares"
                    />
                </Box>

                {/* Signature */}
                <Box
                    sx={{
                        position: "absolute",
                        top: 27,
                        right: 22,
                        width: "190px",
                        height: "50px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: loadingSignature ? "rgba(255,255,255,0.6)" : "transparent",
                        zIndex: 10000,
                    }}
                >
                    {loadingSignature ? (
                        <CircularProgress size={28} />
                    ) : signatureUrl ? (
                        <img
                            src={signatureUrl}
                            alt="Signature"
                            style={{ width: "100%", height: "100%", objectFit: "fill" }}
                        />
                    ) : (
                        <Typography variant="caption">No Image</Typography>
                    )}
                </Box>

                {/* Full Name */}
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 122,
                        left: 165,
                        width: 250,
                        height: 23,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        zIndex: 2,
                    }}
                >
                    <Typography
                        color="black"
                        sx={{
                            fontSize: (() => {
                                const maxFont = 10;
                                const minFont = 7;
                                const textLength = selectedSCData?.fullName?.length || 1;
                                return `${Math.min(maxFont, Math.max(minFont, 300 / textLength))}pt`;
                            })(),
                            lineHeight: 1,
                            textAlign: "left",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                        }}
                    >
                        {selectedSCData?.fullName}
                    </Typography>
                </Box>

                {/* Birthdate */}
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 88,
                        left: 165,
                        width: 250,
                        height: 23,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        zIndex: 2,
                    }}
                >
                    <Typography
                        color="black"
                        sx={{
                            fontSize: "10pt",
                            lineHeight: 1,
                            textAlign: "left",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                        }}
                    >
                        {selectedSCData?.birthDate
                            ? new Date(selectedSCData.birthDate).toLocaleDateString("en-US")
                            : "No Date"}
                    </Typography>
                </Box>

                {/* Address */}
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 38,
                        left: 165,
                        width: 250,
                        height: 38,
                        display: "flex",
                        justifyContent: "flex-start",
                        zIndex: 2,
                    }}
                >
                    <Typography
                        color="black"
                        sx={{
                            fontSize: (() => {
                                const maxFont = 10;
                                const minFont = 8;
                                const textLength = selectedSCData?.address?.length || 1;
                                return `${Math.min(maxFont, Math.max(minFont, 300 / textLength))}pt`;
                            })(),
                            lineHeight: 1,
                            textAlign: "left",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                        }}
                    >
                        {selectedSCData?.address}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
