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
} from "@mui/material";
import { useSeniorCardDataContext } from "@/app/Contexts/SeniorCardContext";
import FaceCropModal from "../components/imageCrop";
import { SignatureUpload } from "../components/signatureUpload";
import { useUpload } from "@/app/Contexts/uploadContext";
import { useStateContext } from "@/app/Contexts/stateContext";
import { CircularProgress } from "@mui/material";
import { useSnackBar } from "@/app/Contexts/snackBarContext";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel"

interface EditSCModalProps {
    open: boolean;
    onClose: () => void;
}

export default function EditSCModal({ open, onClose }: EditSCModalProps) {
    const { editSCData, selectedSCData, canEditSCID, verifySCID } = useSeniorCardDataContext();
    const { saveSignature, saveUserImage } = useUpload();
    const { signature, setSignature, captured, setCaptured } = useStateContext();
    const { showSnackBar } = useSnackBar();

    const [scidValid, setScidValid] = useState<boolean | null>(null); // null = untouched

    // const scidLabel = selectedSCData?.scid || "unknown";

    const [scid, setScid] = useState(selectedSCData?.scid || "");
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

        setScid(selectedSCData.scid || "");
        setBirthDate(selectedSCData.birthDate || "");
        setFullName(selectedSCData.fullName || "");
        setAddress(selectedSCData.address || "");
        setContactPerson(selectedSCData.contactPerson || "");
        setContactNum(selectedSCData.contactNum || "");
        setContactAddress(selectedSCData.contactAddress || "");

        const loadImages = async () => {
            setPhotoLoading(true);
            setSignatureLoading(true);

            const photoUrl = await fetchImageAsObjectUrl(
                `/api/scpics/Images/${selectedSCData.scid}`,
                ["jpg", "jpeg", "png"]
            );
            const sigUrl = await fetchImageAsObjectUrl(
                `/api/scpics/Signature/${selectedSCData.scid}`,
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
        setScid(originalData.scid || "");
        setBirthDate(originalData.birthDate || "");
        setFullName(originalData.fullName || "");
        setAddress(originalData.address || "");
        setContactPerson(originalData.contactPerson || "");
        setContactNum(originalData.contactNum || "");
        setContactAddress(originalData.contactAddress || "");

        // Clear any new captures so previews fallback to DB images
        setCaptured("");
        setSignature("");

        // Reload images from disk
        setPhotoLoading(true);
        setSignatureLoading(true);

        const photoUrl = await fetchImageAsObjectUrl(
            `/api/scpics/Images/${originalData.scid}`,
            ["jpg", "jpeg", "png"]
        );
        const sigUrl = await fetchImageAsObjectUrl(
            `/api/scpics/Signature/${originalData.scid}`,
            ["png", "jpg", "jpeg"]
        );

        setPhotoPreview(photoUrl);
        setPhotoLoading(false);

        setSignaturePreview(sigUrl);
        setSignatureLoading(false);

        showSnackBar("Reverted to original data", "info");
    };



    const handleClose = () =>{
        setCaptured("");
        setPhotoPreview("");
        setSignaturePreview("");
        setSignature("");
        onClose()
    }    

    useEffect(() => {
        runScidValidation(scid);
    }, [suppressVerify]);

    const getScidNumber = (scid: string) => {
        // Split by '-' and get the numeric part
        const parts = scid.split("-");
        return parts.length >= 3 ? parts[2] : scid;
    };


    const runScidValidation = async (value: string) => {
        if (suppressVerify) {
            setScidValid(null); // skip verification
            return;
        }

        const originalNumber = getScidNumber(selectedSCData?.scid || "");
        const newNumber = getScidNumber(value);

        if (newNumber === originalNumber) {
            setScidValid(true); // numeric part unchanged => treat as valid
            return;
        }

        setScidValid(null); // show "Checking SCID..." temporarily
        const exists = await verifySCID(value);
        setScidValid(!exists);
    };

    const handleScidInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const start = input.selectionStart; // save cursor
        const end = input.selectionEnd;

        let val = e.target.value.toUpperCase(); // transform if needed

        setScid(val); // update state

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

        if (!suppressVerify && scid !== selectedSCData.scid && scidValid === false) {
            showSnackBar("SCID already exists. Please choose another.", "error");
            return;
        }


        const updatedData = {
            ...selectedSCData,
            scid: scid.toUpperCase(),
            fullName: fullName.toUpperCase(),
            birthDate,
            address: address.toUpperCase(),
            contactPerson: contactPerson.toUpperCase(),
            contactNum,
            contactAddress: contactAddress.toUpperCase(),
            oldScid: selectedSCData.scid,   // pass old
            newScid: scid.toUpperCase(),    // pass new
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
            showSnackBar(`No new changes for SC ${scid}`, "info");
            return;
        }

        try {
            if (isPhotoChanged) {
                await saveUserImage(captured!, `${scid}.jpg`);
            }

            if (isSignatureChanged) {
                await saveSignature(signature!, `${scid}.png`);
            }

            showSnackBar(`SC ${scid} updated successfully`, "success");
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Failed to upload images/signature.");
        }
    };


    // input helper with optional uppercase
    const inputField = (
        label: string,
        value: string,
        onChange?: (val: string) => void,
        readOnly = false,
        forceUppercase = false
    ) => (
        <TextField
            label={label}
            value={value}
            onChange={
                onChange
                    ? (e) => {
                        let val = e.target.value;
                        if (forceUppercase) val = val.toUpperCase();
                        onChange(val);
                    }
                    : undefined
            }
            fullWidth
            InputProps={{ readOnly }}
            InputLabelProps={label === "Birthdate" ? { shrink: true } : undefined}
            type={label === "Birthdate" ? "date" : "text"}
        />
    );    

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
                            Senior Details
                        </Typography>    
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" }, // stack on mobile
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            {/* SCID input */}
                            <TextField
                                label="SCID"
                                value={scid}
                                onChange={handleScidInputChange}

                                fullWidth
                                InputProps={{
                                    readOnly: !canEditSCID,
                                    endAdornment:
                                        canEditSCID &&
                                            scid !== selectedSCData?.scid &&
                                            scidValid !== null &&
                                            !suppressVerify ? ( // hide icon when skipping
                                            <InputAdornment position="end">
                                                {scidValid ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <CancelIcon color="error" />
                                                )}
                                            </InputAdornment>
                                        ) : null,
                                }}
                                error={canEditSCID && scid !== selectedSCData?.scid && scidValid === false}
                                helperText={
                                    canEditSCID && scid !== selectedSCData?.scid
                                        ? suppressVerify
                                            ? "SCID verification skipped"
                                            : scidValid === null
                                                ? "Checking SCID..."
                                                : scidValid
                                                    ? "SCID is available"
                                                    : "SCID already exists"
                                        : ""
                                }
                                FormHelperTextProps={{
                                    sx: {
                                        color: suppressVerify
                                            ? "text.secondary"
                                            : scidValid === null
                                                ? "text.secondary"
                                                : scidValid
                                                    ? "green"
                                                    : "red",
                                    },
                                }}
                            />

                            {/* Suppress checkbox */}
                            <FormControlLabel
                                sx={{ mt: { xs: 1, sm: 0 } }} // spacing when stacked on mobile
                                control={
                                    <Checkbox
                                        checked={suppressVerify}
                                        onChange={(e) => setSuppressVerify(e.target.checked)}
                                    />
                                }
                                label="Skip SCID Check"
                            />
                        </Box>

                        {inputField("Full Name", fullName, setFullName, false, true)}
                        {inputField(
                            "Birthdate",
                            birthDate ? new Date(birthDate).toISOString().split("T")[0] : "",
                            setBirthDate
                        )}
                        {inputField("Address", address, setAddress, false, true)}
                        {inputField("Contact Person", contactPerson, setContactPerson, false, true)}
                        {inputField("Contact Number", contactNum, setContactNum)}
                        {inputField(
                            "Contact Address",
                            contactAddress,
                            setContactAddress,
                            false,
                            true
                        )}
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
