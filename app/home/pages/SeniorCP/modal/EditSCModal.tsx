"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Divider,
    Typography,
    InputAdornment,
    FormControlLabel,
    Checkbox,
    MenuItem,
} from "@mui/material";
import { useSeniorCardDataContext } from "@/app/Contexts/CardContext";
import FaceCropModal from "../components/imageCrop";
import { SignatureUpload } from "../components/signatureUpload";
import { useUpload } from "@/app/Contexts/uploadContext";
import { useStateContext } from "@/app/Contexts/stateContext";
import { CircularProgress } from "@mui/material";
import { useSnackBar } from "@/app/Contexts/snackBarContext";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel"
import { BARANGAYS } from "../components/barangay";
import { Affiliations } from "./AddSCModal";
import { inputField } from "../components/inputField";

interface EditSCModalProps {
    open: boolean;
    onClose: () => void;
}

const BARANGAYS_LOOKUP: Record<string, string> = Object.fromEntries(
    BARANGAYS.map(b => [b.name.toLowerCase(), b.code])
);

export default function EditSCModal({ open, onClose }: EditSCModalProps) {
    const { editSCData, selectedSCData, canEditSCID, verifySCID } = useSeniorCardDataContext();
    const { saveSignature, saveUserImage } = useUpload();
    const { signature, setSignature, captured, setCaptured } = useStateContext();
    const { showSnackBar } = useSnackBar();

    const [youthidValid, setYouthidValid] = useState<boolean | null>(null); // null = untouched

    // const youthidLabel = selectedSCData?.youthid || "unknown";

    const [youthid, setYouthid] = useState(selectedSCData?.youthid || "");
    const [birthDate, setBirthDate] = useState("");
    const [fullName, setFullName] = useState("");
    const [address, setAddress] = useState("");
    const [contactPerson, setContactPerson] = useState("");
    const [contactNum, setContactNum] = useState("");
    const [contactAddress, setContactAddress] = useState("");

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

    const [photoLoading, setPhotoLoading] = useState(false);
    const [signatureLoading, setSignatureLoading] = useState(false);

    const [originalData, setOriginalData] = useState<any>(null);
    const [suppressVerify, setSuppressVerify] = useState(false);

    const [overrideBarangay, setOverrideBarangay] = useState(false);
    const [barangayCode, setBarangayCode] = useState(
        BARANGAYS_LOOKUP[selectedSCData?.barangay?.toLowerCase() || ""] || ""
    );

    const [selectedAffiliation, setSelectedAffiliation] = useState(
        selectedSCData?.affiliates || ""
    );

    useEffect(() => {
        if (!selectedSCData || overrideBarangay) return;

        // Get the barangay name from the code
        const selectedBarangay = BARANGAYS.find(b => b.code === barangayCode)?.name;
        if (!selectedBarangay) return;

        // Update only the BRGY. part of the address
        setAddress(prev => {
            // Regex to match "BRGY. ..." in the address
            const newAddress = prev.replace(/BRGY\.\s*[^,]+/i, selectedBarangay);
            return newAddress.includes("BRGY.") ? newAddress : `${prev}, ${selectedBarangay}`;
        });
    }, [barangayCode, overrideBarangay]);



    // fetch images
    const fetchImageAsObjectUrl = async (baseUrl: string, exts: string[]) => {
        for (const ext of exts) {
            const url = `${baseUrl}.${ext}`;
            try {
                const res = await fetch(url);
                if (!res.ok) continue;
                const blob = await res.blob();
                return URL.createObjectURL(blob);
            } catch {
                continue;
            }
        }
        return null;
    };

    // populate form when selectedSCData changes
    useEffect(() => {
        if (!selectedSCData) return;

        // Save original snapshot for revert
        setOriginalData(selectedSCData);

        setYouthid(selectedSCData.youthid || "");
        setBirthDate(selectedSCData.birthDate || "");
        setFullName(selectedSCData.fullName || "");
        setAddress(selectedSCData.address || "");
        setContactPerson(selectedSCData.contactPerson || "");
        setContactNum(selectedSCData.contactNum || "");
        setContactAddress(selectedSCData.contactAddress || "");
        const code = BARANGAYS_LOOKUP[selectedSCData.barangay?.toLowerCase() || ""] || "";
        setBarangayCode(code);

        setSelectedAffiliation(selectedSCData.affiliates || "");

        const loadImages = async () => {
            setPhotoLoading(true);
            setSignatureLoading(true);

            const photoUrl = await fetchImageAsObjectUrl(
                `/api/youthpics/Images/${selectedSCData.youthid}`,
                ["jpg", "jpeg", "png"]
            );
            const sigUrl = await fetchImageAsObjectUrl(
                `/api/youthpics/Signature/${selectedSCData.youthid}`,
                ["png", "jpg", "jpeg"]
            );

            setPhotoPreview(photoUrl);
            setCaptured(photoUrl);
            setSignature(sigUrl);
            setPhotoLoading(false);

            setSignaturePreview(sigUrl);
            setSignatureLoading(false);
        };

        loadImages();
    }, [selectedSCData, open]);

    // Revert handler
    const handleRevert = async () => {
        if (!originalData) return;

        // Reset form fields
        setYouthid(originalData.youthid || "");
        setBirthDate(originalData.birthDate || "");
        setFullName(originalData.fullName || "");
        setAddress(originalData.address || "");
        setContactPerson(originalData.contactPerson || "");
        setContactNum(originalData.contactNum || "");
        setContactAddress(originalData.contactAddress || "");
        setBarangayCode(
            BARANGAYS_LOOKUP[originalData.barangay?.toLowerCase() || ""] || ""
        );
        // Clear any new captures so previews fallback to DB images
        setCaptured("");
        setSignature("");

        // Reload images from disk
        setPhotoLoading(true);
        setSignatureLoading(true);

        const photoUrl = await fetchImageAsObjectUrl(
            `/api/youthpics/Images/${originalData.youthid}`,
            ["jpg", "jpeg", "png"]
        );
        const sigUrl = await fetchImageAsObjectUrl(
            `/api/youthpics/Signature/${originalData.youthid}`,
            ["png", "jpg", "jpeg"]
        );

        setPhotoPreview(photoUrl);
        setPhotoLoading(false);

        setSignaturePreview(sigUrl);
        setSignatureLoading(false);

        showSnackBar("Reverted to original data", "info");
    };



    const handleClose = () => {
        setCaptured("");
        setPhotoPreview("");
        setSignaturePreview("");
        setSignature("");
        onClose()
    }

    useEffect(() => {
        runScidValidation(youthid);
    }, [suppressVerify]);

    const getScidNumber = (youthid: string) => {
        // Split by '-' and get the numeric part
        const parts = youthid.split("-");
        return parts.length >= 3 ? parts[2] : youthid;
    };


    const runScidValidation = async (value: string) => {
        if (suppressVerify) {
            setYouthidValid(null); // skip verification
            return;
        }

        const originalNumber = getScidNumber(selectedSCData?.youthid || "");
        const newNumber = getScidNumber(value);

        if (newNumber === originalNumber) {
            setYouthidValid(true); // numeric part unchanged => treat as valid
            return;
        }

        setYouthidValid(null); // show "Checking SCID..." temporarily
        const exists = await verifySCID(value);
        setYouthidValid(!exists);
    };

    const handleScidInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const start = input.selectionStart; // save cursor
        const end = input.selectionEnd;

        let val = e.target.value.toUpperCase(); // transform if needed

        setYouthid(val); // update state

        // restore cursor after React rerender
        requestAnimationFrame(() => {
            if (input.setSelectionRange && start !== null && end !== null) {
                input.setSelectionRange(start, end);
            }
        });

        await runScidValidation(val);
    };




    // Save changes
    // inside handleConfirm
    const handleConfirm = async () => {
        if (!selectedSCData) return;

        if (!suppressVerify && youthid !== selectedSCData.youthid && youthidValid === false) {
            showSnackBar("SCID already exists. Please choose another.", "error");
            return;
        }

        const updatedData = {
            ...selectedSCData,
            youthid: youthid.toUpperCase(),
            fullName: fullName.toUpperCase(),
            birthDate,
            address: address.toUpperCase(),
            barangay: BARANGAYS.find(b => b.code === barangayCode)?.name.toUpperCase() || "",
            contactPerson: contactPerson.toUpperCase(),
            contactNum,
            contactAddress: contactAddress.toUpperCase(),
            oldScid: selectedSCData.youthid,   // pass old
            newScid: youthid.toUpperCase(),    // pass new
            affiliates: selectedAffiliation,
        };

        try {
            await editSCData(updatedData);

            // Only upload if new image/signature is captured
            const isPhotoChanged = captured && captured !== photoPreview;
            const isSignatureChanged = signature && signature !== signaturePreview;

            if (isPhotoChanged || isSignatureChanged) {
                await handleUpload();
            }

            onClose();
        } catch (err) {
            console.error("Failed to update SC Data:", err);
            alert("Failed to save changes.");
        }
    };
    // Upload captured images/signature
    // Upload captured images/signature only if changed
    const handleUpload = async () => {
        const isPhotoChanged = captured && captured !== photoPreview;
        const isSignatureChanged = signature && signature !== signaturePreview;

        if (!isPhotoChanged && !isSignatureChanged) {
            // Nothing to upload
            showSnackBar(`No new changes for SC ${youthid}`, "info");
            return;
        }

        try {
            if (isPhotoChanged) {
                await saveUserImage(captured!, `${youthid}.jpg`);
            }

            if (isSignatureChanged) {
                await saveSignature(signature!, `${youthid}.png`);
            }

            showSnackBar(`SC ${youthid} updated successfully`, "success");
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Failed to upload images/signature.");
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, boxShadow: 6, border: "1px solid rgba(0,0,0,0.1)" },
            }}
            BackdropProps={{ sx: { backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" } }}
        >
            <Box sx={{ bgcolor: "background.default", p: 2, borderRadius: 3 }}>
                <DialogTitle sx={{ fontWeight: "bold" }}>Edit Senior Card</DialogTitle>
                <Divider sx={{ mb: 2 }} />

                <DialogContent
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
                        gap: 3,
                    }}
                >
                    {/* Left: Form Fields */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                            Youth Details
                        </Typography>

                        {inputField({
                            label: "Full Name",
                            value: fullName,
                            onChange: setFullName,
                            forceUppercase: true, // force uppercase
                        })}

                        {inputField({
                            label: "Birthdate",
                            value: birthDate ? new Date(birthDate).toISOString().split("T")[0] : "",
                            onChange: setBirthDate,
                        })}
                        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
                            <TextField
                                select
                                label="Affiliations"
                                value={selectedAffiliation}
                                onChange={(e) => setSelectedAffiliation(e.target.value)}
                                fullWidth
                            >
                                {Affiliations.map((b) => (
                                    <MenuItem key={b} value={b}>
                                        {b}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                        <TextField
                            select
                            label="Barangay"
                            value={barangayCode}
                            onChange={(e) => setBarangayCode(e.target.value)}
                            fullWidth
                        >
                            {BARANGAYS.map((b) => (
                                <MenuItem key={b.code} value={b.code}>
                                    {b.name}
                                </MenuItem>
                            ))}
                        </TextField>
                        {inputField({
                            label: "Address",
                            value: address,
                            onChange: setAddress,
                            forceUppercase: true, // force uppercase
                        })}

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={overrideBarangay}
                                    onChange={(e) => setOverrideBarangay(e.target.checked)}
                                />
                            }
                            label="Do not auto-update barangay in address"
                        />
                      
                    </Box>

                    {/* Right: Preview Section */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                            Previews
                        </Typography>

                        {/* Photo */}
                        <Box
                            sx={{
                                p: 1,
                                border: "1px solid rgba(0,0,0,0.1)",
                                borderRadius: 2,
                                textAlign: "center",
                                bgcolor: "background.paper",
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Photo
                            </Typography>
                            <Box
                                sx={{
                                    width: 140,
                                    height: 140,
                                    mx: "auto",
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    border: "1px solid rgba(0,0,0,0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {photoLoading ? (
                                    <CircularProgress size={24} />
                                ) : captured || photoPreview ? (
                                    <img
                                        src={captured || photoPreview || ""}
                                        alt="Photo"
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                ) : (
                                    <Typography variant="caption" color="text.secondary">
                                        NO DATA
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        {/* Signature */}
                        <Box
                            sx={{
                                p: 1,
                                border: "1px solid rgba(0,0,0,0.1)",
                                borderRadius: 2,
                                textAlign: "center",
                                bgcolor: "background.paper",
                                display: "flex",            // enable flex
                                flexDirection: "column",    // stack label + content
                                alignItems: "center",       // center horizontally
                                justifyContent: "center",   // center vertically if needed
                            }}
                        >
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                Signature
                            </Typography>
                            <Box
                                sx={{
                                    width: 240,
                                    height: 120,
                                    borderRadius: 2,
                                    overflow: "hidden",
                                    border: "1px solid rgba(0,0,0,0.1)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "background.default",
                                }}
                            >
                                {signatureLoading ? (
                                    <CircularProgress size={24} />
                                ) : signature || signaturePreview ? (
                                    <img
                                        src={signature || signaturePreview || ""}
                                        alt="Signature"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "fill",   // keeps ratio
                                        }}
                                    />
                                ) : (
                                    <Typography variant="caption" color="text.secondary">
                                        NO DATA
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                    </Box>
                </DialogContent>

                <DialogActions
                    sx={{
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 1,
                        px: 3,
                        pb: 2,
                        justifyContent: "flex-end", // align everything right
                        alignItems: "center",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            gap: 1,
                            width: { xs: "100%", sm: "auto" },
                            alignItems: "flex-end", // ensures right alignment on mobile
                        }}
                    >
                        <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleRevert}
                                size="small"
                                fullWidth={true} // or remove, Box already handles width
                            >
                                Revert
                            </Button>
                        </Box>


                        <FaceCropModal fullwidth />
                        <SignatureUpload fullwidth />
                        <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
                            <Button
                                variant="outlined"
                                onClick={handleClose}
                                size="small"
                                fullWidth={true} // optional, Box handles width
                            >
                                Cancel
                            </Button>
                        </Box>
                        <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleConfirm}
                                size="small"
                                fullWidth={true} // optional
                            >
                                Save
                            </Button>
                        </Box>
                    </Box>
                </DialogActions>


            </Box>
        </Dialog>
    );
}
