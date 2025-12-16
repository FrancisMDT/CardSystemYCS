"use client";
import React, {
    useRef,
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from "react";
import Image from "next/image";
import { QRCode } from "react-qrcode-logo";
import { useReactToPrint } from "react-to-print";
import { Box, Paper, Typography } from "@mui/material";
import { useLoading } from "@/app/Contexts/LoadingContext";
import { useSeniorCardDataContext } from "@/app/Contexts/CardContext";
import FrontCard from "./FrontCard";
import BackCard from "./BackCard";
import { YouthCardModel } from "@/app/models/SeniorCard/youthCardModel";

export const PrintButton = forwardRef<any, any>((_, ref) => {
    const [printData, setPrintData] = useState<YouthCardModel | null>(null);
    const componentRef = useRef<HTMLDivElement | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null); // objectURL or null
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null); // objectURL or null

    const tempObjectUrlsRef = useRef<string[]>([]); // track for revoking
    const { setLoading } = useLoading();
    const { markAsPrinted, selectedSCData } = useSeniorCardDataContext();

    const printHandler = useReactToPrint({
        contentRef: componentRef,
        pageStyle: `
            @page { size: 85.60mm 54mm; margin: 0; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

            @media print {
                .print-page {
                position: relative !important;
                left: auto !important;
                top: auto !important;
                opacity: 1 !important;
                pointer-events: auto !important;
                page-break-after: always;
                width: 430px;
                height: 271px;
                }

                .print-page:last-child {
                page-break-after: avoid !important;
                }

                .print-section {
                margin: 0;
                padding: 0;
                }
            }
            `,
        onAfterPrint: () => {
            if (selectedSCData?.youthid) {
                markAsPrinted(selectedSCData?.youthid);
            }
            else {
                console.error("selectedSCData.scid is undefined");
            }
        }

    });

    // Helper: try fetch an image URL + return an objectURL if found
    const fetchImageAsObjectUrl = async (
        baseUrl: string,
        exts: string[]
    ): Promise<{ foundUrl: string; objectUrl: string } | null> => {
        for (const ext of exts) {
            const url = `${baseUrl}.${ext}`;
            try {
                const res = await fetch(url);
                if (!res.ok) continue;
                const blob = await res.blob();
                const objectUrl = URL.createObjectURL(blob);
                return { foundUrl: url, objectUrl };
            } catch {
                // continue
            }
        }
        return null;
    };

    // Utility: wait a tick for React to flush DOM
    const rafTick = () =>
        new Promise<void>((resolve) => {
            requestAnimationFrame(() => setTimeout(resolve, 0));
        });

    // Wait for all <img> inside the componentRef to finish loading (or timeout)
    const waitForImgsToLoad = async (timeoutMs = 3500) => {
        const container = componentRef.current;
        if (!container) return;
        const imgs = Array.from(container.querySelectorAll("img"));
        if (imgs.length === 0) return;

        await new Promise<void>((resolve) => {
            let finished = false;
            let loaded = 0;
            const check = () => {
                loaded++;
                if (loaded >= imgs.length && !finished) {
                    finished = true;
                    resolve();
                }
            };

            imgs.forEach((img) => {
                if ((img as HTMLImageElement).complete) {
                    check();
                } else {
                    (img as HTMLImageElement).addEventListener(
                        "load",
                        () => {
                            check();
                        },
                        { once: true }
                    );
                    (img as HTMLImageElement).addEventListener(
                        "error",
                        () => {
                            check();
                        },
                        { once: true }
                    );
                }
            });

            // safety timeout
            setTimeout(() => {
                if (!finished) {
                    finished = true;
                    resolve();
                }
            }, timeoutMs);
        });
    };

    // Clean up previous temporary object URLs
    const revokeTempObjectUrls = () => {
        tempObjectUrlsRef.current.forEach((u) => {
            try {
                URL.revokeObjectURL(u);
            } catch { }
        });
        tempObjectUrlsRef.current = [];
    };

    useImperativeHandle(ref, () => ({
        handlePrint: async (rowData: YouthCardModel) => {
            revokeTempObjectUrls();
            setLoading?.(true);
            const photoResult = await fetchImageAsObjectUrl(
                `/api/youthpics/Images/${rowData.youthid}`,
                ["jpg", "jpeg", "png"]
            );
            const sigResult = await fetchImageAsObjectUrl(
                `/api/youthpics/Signature/${rowData.youthid}`,
                ["png", "jpg", "jpeg"]
            );

            if (photoResult) tempObjectUrlsRef.current.push(photoResult.objectUrl);
            if (sigResult) tempObjectUrlsRef.current.push(sigResult.objectUrl);

            setPhotoUrl(photoResult ? photoResult.objectUrl : null);
            setSignatureUrl(sigResult ? sigResult.objectUrl : null);

            setPrintData(rowData);
            await rafTick();
            await new Promise((r) => setTimeout(r, 40));

            await waitForImgsToLoad(3500);

            setLoading?.(false);
            printHandler();
            setTimeout(() => revokeTempObjectUrls(), 5000);
        },
    }));

    useEffect(() => {
        return () => {
            revokeTempObjectUrls();
        };
    }, []);



    return (
        <Box display="flex" flexDirection="column" alignItems="center">
            {printData && (
                <Box
                    ref={componentRef}
                    className="print-section"
                    sx={{ margin: 0, padding: 0 }}
                >
                    {/* Front Page */}
                    <FrontCard
                        selectedSCData={printData}
                        photoUrl={photoUrl}
                        operation="print"
                        loadingPhoto={false}
                        signatureUrl={signatureUrl}
                        loadingSignature={false}
                    />

                    {/* Back Page */}
                    <BackCard
                        selectedSCData={selectedSCData}
                        signatureUrl={signatureUrl}             
                        operation="print"           
                    />
                </Box>
            )}
        </Box>
    );
});
