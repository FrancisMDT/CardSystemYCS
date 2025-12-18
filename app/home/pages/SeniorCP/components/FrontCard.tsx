"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import QRCode from "react-qrcode-logo";
import { YouthCardModel } from "@/app/models/SeniorCard/youthCardModel";
import { useEncryption } from "@/app/Contexts/EncryptionContext";

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

    const { encryptData } = useEncryption();
    const [qrValue, setQrValue] = useState("");

    useEffect(() => {
        if (selectedSCData?.youthid) {
            const generateQr = async () => {
                const encrypted = await encryptData(selectedSCData.youthid || "");
                console.log("Encrypted QR Value:", encrypted);
                setQrValue(encrypted);
            };
            generateQr();
        }
    }, [selectedSCData, encryptData]);

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

                {/* Background */}
                <Box sx={{ position: "absolute", top: -1, left: 0, width: "100%", height: "100%", zIndex: 1}}>
                    <img
                        src="/youthid_front.png"
                        alt="Background"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                </Box>

                {/* QR Code */}
                <Box sx={{ position: "absolute", top: 29, right: 5, zIndex: 2 }}>
                    <QRCode
                        value={qrValue}
                        size={148}
                        bgColor="#FFFFFF00"
                        style={{ maxWidth: "100%", width: "87px", height: "auto" }}
                        removeQrCodeBehindLogo
                        qrStyle="squares"
                    />
                </Box>

                {/* Signature */}
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 107,
                        left: 165,
                        width: 250,
                        // height: "50px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        // bgcolor: loadingSignature ? "rgba(255,255,255,0.6)" : "transparent",
                        zIndex: 10000,
                        // backgroundColor: "black",
                        // opacity: 0.5,
                    }}
                >
                    {loadingSignature ? (
                        <CircularProgress size={28} />
                    ) : signatureUrl ? (
                            <img
                                src={signatureUrl}
                                alt="Signature"
                                style={{
                                    maxWidth: "90%",   // scale down to fit box width
                                    maxHeight: "50px",  // adjust max height as needed
                                    objectFit: "contain" // keep aspect ratio
                                }}
                            />
                    ) : (
                        <Typography variant="caption">No Image</Typography>
                    )}
                </Box>

                {/* Full Name */}
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 95,
                        left: 165,
                        width: 250,
                        height: "fit-content",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2,
                        flexDirection: "column",
                        // backgroundColor: "black",
                    }}
                >
                    
                    <Typography
                        color="black"
                        sx={{
                            fontSize: (() => {
                                const maxFont = 18;
                                const minFont = 10;
                                const textLength = selectedSCData?.fullName?.length || 1;
                                return `${Math.min(maxFont, Math.max(minFont, 300 / textLength))}pt`;
                            })(),
                            lineHeight: 1,
                            textAlign: "center",

                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            color: "#021585",
                            fontWeight: 900,
                        }}
                    >
                        {selectedSCData?.fullName}
                    </Typography>                    
                </Box>

                {/* Address */}
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 82,
                        left: 165,
                        width: 250,
                        height: "fit-content",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2,
                        flexDirection: "column",
                        // backgroundColor: "black",
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
                        {selectedSCData?.address?.split(",")[0]?.trim() || ""}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 69,
                        left: 165,
                        width: 250,
                        height: "fit-content",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2,
                        flexDirection: "column",
                    }}
                >
                    <Typography
                        color="black"
                        sx={{
                            fontSize: (() => {
                                const maxFont = 10;
                                const minFont = 8;
                                const textLength = selectedSCData?.barangay?.length || 1;
                                return `${Math.min(maxFont, Math.max(minFont, 300 / textLength))}pt`;
                            })(),
                            lineHeight: 1,
                            textAlign: "left",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            fontWeight: 900,
                        }}
                    >
                        {selectedSCData?.barangay}
                    </Typography>
                </Box>

                <Box
                    sx={{
                        position: "absolute",
                        bottom: 1,
                        left: 25,
                        width: 250,
                        height: 35,
                        display: "flex",
                        zIndex: 2,
                        // alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        // backgroundColor: "black",
                    }}
                >
                    <Typography
                        color="white"
                        sx={{
                            fontSize: (() => {
                                const maxFont = 14;
                                const minFont = 10;
                                const textLength = selectedSCData?.affiliates?.length || 1;
                                return `${Math.min(maxFont, Math.max(minFont, 300 / textLength))}pt`;
                            })(),
                            lineHeight: 1,
                            textAlign: "left",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            fontWeight: 600,
                        }}
                    >
                        {selectedSCData?.affiliates}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 32,
                        left: 25,
                        width: 250,
                        height: 35,
                        display: "flex",
                        zIndex: 2,
                        // alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        // backgroundColor: "black",
                    }}
                >
                    <Typography
                        color="black"
                        sx={{
                            fontSize: (() => {
                                const maxFont = 12.5;
                                const minFont = 10;
                                const textLength = selectedSCData?.youthid?.length || 1;
                                return `${Math.min(maxFont, Math.max(minFont, 300 / textLength))}pt`;
                            })(),
                            lineHeight: 1,
                            textAlign: "left",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            fontWeight: 600,
                        }}
                    >
                        {selectedSCData?.youthid}
                    </Typography>
                </Box>
              
            </Box>
        </Box>
    );
}
