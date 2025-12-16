"use client";

import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { YouthCardModel } from "@/app/models/SeniorCard/youthCardModel";

interface BackCardProps {
    selectedSCData: Partial<YouthCardModel> | null;
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
                <Box sx={{ position: "absolute", top: -1, left: 0, width: "100%", height: "100%" }}>
                    <img
                        src="/youthid_back.jpg"
                        alt="Background"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                </Box>                
            </Box>
        </Box>
    );
}
