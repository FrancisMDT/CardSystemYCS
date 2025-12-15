"use client";

import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { SeniorCardModel } from "@/app/models/SeniorCard/seniorCardModel";

interface BackCardProps {
    selectedSCData: Partial<SeniorCardModel> | null;
    signatureUrl: string | null;
    loadingSignature?: boolean;
    operation?: "view" | "print";
}

export default function BackCard({
    selectedSCData,
    signatureUrl,
    loadingSignature,
    operation = "view",
}: BackCardProps) {
    const isPrint = operation === "print";

    return (
        <Box
            className="print-page"
            sx={{
                position: isPrint ? "absolute" : "relative",
                opacity: isPrint ? 0 : 1,
                left: 0,
                top: 0,
                pointerEvents: isPrint ? "none" : "auto",
                width: 430,
                height: 271,
                overflow: "hidden",
                bgcolor: "#FFF",
                "@media print": {
                    position: "absolute",
                    opacity: 1,
                    pointerEvents: "auto",
                },
            }}
        >
            <Box
                sx={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    transform: isPrint ? "rotate(180deg)" : "none",
                    transition: "transform 0.3s",
                }}
            >
                {/* Background */}
                <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
                    <img
                        src="/Senior_Card_Back3.png"
                        alt="Background"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                </Box>

                {/* Contact Person */}
                <Box
                    sx={{
                        position: "absolute",
                        top: 20,
                        left: 15,
                        width: 190,
                        height: 14,
                        bgcolor: "#FFF",
                        display: "flex",
                        alignItems: "center",   // vertical centering
                        justifyContent: "flex-start", // left-aligned text
                    }}
                >
                    <Typography
                        color="black"
                        sx={{
                            fontSize: (() => {
                                const maxFont = 8;
                                const minFont = 6;
                                const boxWidth = 190;
                                const textLength = selectedSCData?.contactPerson?.length || 1;

                                const charWidth = 7; // approximate width of one character at maxFont
                                const calculatedFont = (boxWidth / textLength) * (maxFont / charWidth);

                                return `${Math.max(minFont, Math.min(maxFont, calculatedFont))}pt`;
                            })(),
                            textAlign: "left",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                        }}
                    >
                        {selectedSCData?.contactPerson}
                    </Typography>
                </Box>



                {/* Contact Number */}
                <Box sx={{ position: "absolute", top: 42, left: 15, width: 250, height: 23 }}>
                    <Typography color="black" sx={{ fontSize: "10pt" }}>
                        {selectedSCData?.contactNum}
                    </Typography>
                </Box>

                {/* Contact Address */}
                <Box sx={{ position: "absolute", top: 68, left: 15, width: 190, height: 23 }}>
                    <Typography
                        color="black"
                        sx={{
                            fontSize: (() => {
                                const maxFont = 10;
                                const minFont = 6;
                                const textLength = selectedSCData?.contactAddress?.length || 1;
                                return `${Math.min(maxFont, Math.max(minFont, 300 / textLength))}pt`;
                            })(),
                            lineHeight: 1,
                            textAlign: "left",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                        }}
                    >
                        {selectedSCData?.contactAddress}
                    </Typography>
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
            </Box>
        </Box>
    );
}
