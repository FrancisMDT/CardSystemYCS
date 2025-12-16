"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Typography,
    Select,
    Divider,
    IconButton,
    InputAdornment,
    FormHelperText,
    Checkbox,
} from "@mui/material";
import { useSeniorCardDataContext } from "@/app/Contexts/CardContext";
import { BARANGAYS } from "../components/barangay";
import { SignatureUpload } from "../components/signatureUpload";
import FaceCropModal from "../components/imageCrop";
import PrintIcon from "@mui/icons-material/Print";
import { useUpload } from "@/app/Contexts/uploadContext";
import { useStateContext } from "@/app/Contexts/stateContext";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useSnackBar } from "@/app/Contexts/snackBarContext";
import ClearIcon from "@mui/icons-material/Clear";
import VLSearchModal from "./SearchVLData";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from '@mui/icons-material/Search';
import { YouthCardModel } from "@/app/models/SeniorCard/youthCardModel";

interface NewSCIDModalProps {
    open: boolean;
    onClose: () => void;
}

const Affiliations = [
    "Lucena Youth Cultural Organization",
    "Lucena Youth Academic Circle",
    "The Breakfast Club",
    "Youth for Earth",
    "Halina Kabataan"
];

export default function NewSCIDModal({ open, onClose }: NewSCIDModalProps) {
    const [selectedAffiliation, setSelectedAffiliation] = useState("");
    const [barangayCode, setBarangayCode] = useState("");
    const { idNumber, setIdNumber, addSCData, verifySCID, setScidExists, scidExists } = useSeniorCardDataContext();
    const [nameFormat, setNameFormat] = useState<"single" | "split">("single");

    const singleFullNameRef = useRef<HTMLInputElement>(null);
    const firstNameRef = useRef<HTMLInputElement>(null);
    const middleNameRef = useRef<HTMLInputElement>(null);
    const lastNameRef = useRef<HTMLInputElement>(null);
    const suffixRef = useRef<HTMLInputElement>(null);

    const contactSingleRef = useRef<HTMLInputElement>(null);
    const contactFirstRef = useRef<HTMLInputElement>(null);
    const contactMiddleRef = useRef<HTMLInputElement>(null);
    const contactLastRef = useRef<HTMLInputElement>(null);
    const contactSuffixRef = useRef<HTMLInputElement>(null);

    const streetAddressRef = useRef<HTMLInputElement>(null);
    const contactNumberRef = useRef<HTMLInputElement>(null);
    const contactAddressRef = useRef<HTMLInputElement>(null);

    const [birthDate, setBirthDate] = useState("");
    const [streetAddress, setStreetAddress] = useState("");

    const { captured, signature, setCaptured, setSignature } = useStateContext();
    const { saveSignature, saveUserImage } = useUpload();
    const { showSnackBar } = useSnackBar();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVL, setSelectedVL] = useState<any | null>(null); // store the selected VL row


    const scidLabel = `LC-YMC-${idNumber.padEnd(6, "_")}`;

    const handleUpload = async () => {
        if (!captured) return alert("No image captured!");
        if (!signature) return alert("No signature captured!");
        await saveUserImage(captured, `${scidLabel}.jpg`);
        await saveSignature(signature, `${scidLabel}.png`);
    };

    const handleClearAll = () => {
        setIdNumber("");        
        setNameFormat("single");
        setBirthDate("");
        setStreetAddress("");
        const allRefs = [
            singleFullNameRef,
            firstNameRef,
            middleNameRef,
            lastNameRef,
            suffixRef,
            contactSingleRef,
            contactFirstRef,
            contactMiddleRef,
            contactLastRef,
            contactSuffixRef,
            streetAddressRef,
            contactNumberRef,
            contactAddressRef,
        ];
        allRefs.forEach(ref => {
            if (ref.current) ref.current.value = "";
        });
        setCaptured("");
        setSignature("");
    };

    const handleClose = () => {
        onClose();
    };

    const compiledFullName =
        nameFormat === "single"
            ? (singleFullNameRef.current?.value || "").toUpperCase()
            : `${(lastNameRef.current?.value || "").toUpperCase()}, ${(firstNameRef.current?.value || "").toUpperCase()} ${(middleNameRef.current?.value || "").toUpperCase()}${suffixRef.current?.value ? " " + suffixRef.current.value.toUpperCase() : ""}.`;

    const compiledContactName =
        nameFormat === "single"
            ? (contactSingleRef.current?.value || "").toUpperCase()
            : `${(contactLastRef.current?.value || "").toUpperCase()}, ${(contactFirstRef.current?.value || "").toUpperCase()} ${(contactMiddleRef.current?.value || "").toUpperCase()}${contactSuffixRef.current?.value ? " " + contactSuffixRef.current.value.toUpperCase() : ""}.`;

    const compiledAddress = [
        streetAddress || "",
        BARANGAYS.find(b => b.code === barangayCode)?.name.toUpperCase() || "",
        "LUCENA CITY",
    ]
        .filter(part => part && part.trim().length > 0)
        .join(", ");

    const age = birthDate
        ? Math.floor((new Date().getTime() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        : 0;

    const scidComplete = !scidLabel.includes("_");
    const fullNameExists = compiledFullName.trim().length > 0;
    const addressExists = compiledAddress.trim().length > 0;
    const canConfirm = scidComplete && fullNameExists && addressExists && !scidExists;

    const handleConfirm = async () => {
        const newSCData: Partial<YouthCardModel> = {
            youthid: scidLabel,
            fullName: compiledFullName.toUpperCase(),
            birthDate,
            address: compiledAddress.toUpperCase(),
            barangay: BARANGAYS.find(b => b.code === barangayCode)?.name.toUpperCase() || "",
            affiliates: selectedAffiliation,
            contactPerson: compiledContactName.toUpperCase() || "-",
            contactNum: contactNumberRef.current?.value || "-",
            contactAddress: contactAddressRef.current?.value.toUpperCase() || "-",
        };
        try {
            console.log("New SC Data to add:", newSCData);
            await addSCData(newSCData);
            if (captured && signature) await handleUpload();
            handleClearAll();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to save SC Data.");
        }
    };

    const [checkSCID, setCheckSCID] = useState(false);

    useEffect(() => {
        if (checkSCID && idNumber) { // only verify when checkbox is checked
            const scid = `${idNumber.padStart(6, "0")}`; // zero-pad just in case
            verifySCID(scid);
        }
    }, [idNumber, barangayCode, checkSCID]);


    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: "background.default",
                        borderRadius: 3,
                        boxShadow: "none",
                        border: "1px solid rgba(0,0,0,0.1)",
                    },
                }}
                BackdropProps={{
                    sx: {
                        backgroundColor: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(4px)",
                    },
                }}
            >
                <Box sx={{ bgcolor: "background.default", p: { xs: 2, md: 3 } }}>
                    <DialogTitle
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            justifyContent: "space-between",
                            alignItems: { xs: "flex-start", md: "center" },
                            gap: 2,
                        }}
                    >
                        <Typography>New Youth Card Entry</Typography>
                        <FormControl size="small" sx={{ width: { xs: "100%", md: "50%" } }}>
                            <Select
                                value={nameFormat}
                                onChange={(e) => setNameFormat(e.target.value as "single" | "split")}
                            >
                                <MenuItem value="single">Single Field (Full Name & Contact Person)</MenuItem>
                                <MenuItem value="split">Split Fields</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogTitle>

                    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {/* SCID + Preview */}
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", md: "row" },
                                gap: { xs: 2, md: 4 },
                            }}
                        >
                            {/* SCID Info */}
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle2">SCID</Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Typography variant="h6">{scidLabel}</Typography>
                                    {checkSCID && idNumber && scidExists !== null && (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                            {scidExists ? (
                                                <>
                                                    <CancelIcon color="error" fontSize="small" />
                                                    <Typography variant="subtitle1" color="error.main">YouthID already exists</Typography>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircleIcon color="success" fontSize="small" />
                                                        <Typography variant="subtitle1" color="success.main">YouthID available</Typography>
                                                </>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                                <FormControl sx={{ gap: 2, mt: 1 }}>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                        <TextField
                                            label="6-digit ID"
                                            value={idNumber}
                                            onChange={(e) => {
                                                let input = e.target.value.replace(/\D/g, "").slice(-6);
                                                setIdNumber(input.padStart(6, "0"));
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.shiftKey && e.key.toLowerCase() === "s") {
                                                    e.preventDefault();
                                                    setIdNumber("");
                                                }
                                            }}
                                            inputProps={{ style: { textTransform: "uppercase", textAlign: "center" } }}
                                            InputProps={{
                                                endAdornment: idNumber ? (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            onClick={() => setIdNumber("")}
                                                            size="small"
                                                            edge="end"
                                                        >
                                                            <ClearIcon fontSize="small" />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ) : null,
                                            }}
                                        />                  
                                        <FormControlLabel
                                            // labelPlacement="start"
                                            control={
                                                <Checkbox
                                                    checked={checkSCID}
                                                    onChange={(e) => setCheckSCID(e.target.checked)}
                                                    color="primary"

                                                />
                                            }
                                            label="Check YouthID"
                                        />                      
                                    </Box>
                                </FormControl>
                            </Box>

                            {/* Picture & Signature */}
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: { xs: "column", md: "row" },
                                    gap: 2,
                                    alignItems: "center",
                                }}
                            >
                                {/* Picture */}
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, width: { xs: "80%", md: 120 } }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Picture</Typography>
                                    <Box
                                        sx={{
                                            width: "100%",
                                            height: { xs: 100, md: 120 },
                                            border: "1px solid",
                                            borderColor: "divider",
                                            borderRadius: 2,
                                            overflow: "hidden",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        {captured ? <img src={captured} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Typography variant="caption">NO DATA</Typography>}
                                    </Box>
                                </Box>

                                {/* Signature */}
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, width: { xs: "100%", md: 240 } }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Signature</Typography>
                                    <Box
                                        sx={{
                                            width: "100%",
                                            height: { xs: 100, md: 120 },
                                            border: "1px solid",
                                            borderColor: "divider",
                                            borderRadius: 2,
                                            overflow: "hidden",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        {signature ? <img src={signature} style={{ width: "100%", height: "100%", objectFit: "fill" }} /> : <Typography variant="caption">NO DATA</Typography>}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        {/* Senior Data */}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                                Youth Data
                            </Typography>
                            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: nameFormat === "single" ? "row" : "column" }, gap: 2 }}>
                                {nameFormat === "single" ? (
                                    <TextField label="Full Name" inputRef={singleFullNameRef} fullWidth inputProps={{ style: { textTransform: "uppercase" } }} />
                                ) : (
                                    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 1 }}>
                                        <TextField label="Last Name" inputRef={lastNameRef} fullWidth inputProps={{ style: { textTransform: "uppercase" } }} />
                                        <TextField label="First Name" inputRef={firstNameRef} fullWidth inputProps={{ style: { textTransform: "uppercase" } }} />
                                        <TextField label="Middle Name" inputRef={middleNameRef} fullWidth inputProps={{ style: { textTransform: "uppercase" } }} />
                                        <TextField label="Suffix" inputRef={suffixRef} fullWidth inputProps={{ style: { textTransform: "uppercase" } }} />
                                    </Box>
                                )}
                                <TextField
                                    label="Birthdate"
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                />
                            </Box>

                            {/* Address */}
                            <TextField
                                label="Street / Address"
                                inputRef={streetAddressRef}
                                fullWidth
                                value={streetAddress}
                                onChange={(e) => setStreetAddress(e.target.value.toUpperCase())}
                                InputProps={{ style: { textTransform: "uppercase" } }}
                            />

                            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
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

                                <TextField label="City" value="LUCENA CITY" disabled fullWidth inputProps={{ style: { textTransform: "uppercase" } }} />
                            </Box>

                            {/* Address Preview */}
                            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", gap: 1 }}>
                                <Typography variant="subtitle2">Address Preview (click to copy):</Typography>
                                <Typography
                                    variant="caption"
                                    sx={{ userSelect: "text", whiteSpace: "pre-wrap", wordBreak: "break-word", cursor: "pointer" }}
                                    onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
                                        if (!compiledAddress) return;
                                        const target = e.currentTarget;
                                        const selection = window.getSelection();
                                        const range = document.createRange();
                                        range.selectNodeContents(target);
                                        if (selection) {
                                            selection.removeAllRanges();
                                            selection.addRange(range);
                                        }
                                        try {
                                            const successful = document.execCommand("copy");
                                            showSnackBar(successful ? "Address copied to clipboard" : "Failed to copy", successful ? "success" : "error");
                                        } catch {
                                            showSnackBar("Failed to copy address", "error");
                                        }
                                        setTimeout(() => {
                                            const sel = window.getSelection();
                                            if (sel) sel.removeAllRanges();
                                        }, 100);
                                    }}
                                >
                                    {compiledAddress}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {/* <Typography variant="subtitle2" fontWeight="bold">
                                Affiliation
                            </Typography> */}
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
                        </Box>

                        {/* Contact Person */}
                        {/* <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <Typography variant="subtitle2">Contact Person</Typography>
                            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: nameFormat === "single" ? "row" : "column" }, gap: 2 }}>
                                {nameFormat === "single" ? (
                                    <TextField label="Contact Name" inputRef={contactSingleRef} fullWidth inputProps={{ style: { textTransform: "uppercase" } }} />
                                ) : (
                                    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 1 }}>
                                        <TextField label="First Name" inputRef={contactFirstRef} fullWidth inputProps={{ style: { textTransform: "uppercase" } }} />
                                        <TextField label="Middle Name" inputRef={contactMiddleRef} fullWidth inputProps={{ style: { textTransform: "uppercase" } }} />
                                        <TextField label="Last Name" inputRef={contactLastRef} fullWidth inputProps={{ style: { textTransform: "uppercase" } }} />
                                        <TextField label="Suffix" inputRef={contactSuffixRef} fullWidth inputProps={{ style: { textTransform: "uppercase" } }} />
                                    </Box>
                                )}
                                <TextField
                                    label="Contact Number"
                                    inputRef={contactNumberRef}
                                    fullWidth
                                    inputProps={{ maxLength: 11, inputMode: "numeric", pattern: "[0-9]*" }}
                                    onInput={(e) => {
                                        const input = e.target as HTMLInputElement;
                                        input.value = input.value.replace(/\D/g, "").slice(0, 11);
                                    }}
                                />
                            </Box>
                            <TextField label="Contact Address" inputRef={contactAddressRef} fullWidth inputProps={{ style: { textTransform: "uppercase" } }} />
                        </Box> */}
                    </DialogContent>

                    <DialogActions
                        sx={{
                            flexDirection: { xs: "column", md: "row" },
                            justifyContent: "space-between",
                            p: 2,
                            gap: 1,
                        }}
                    >
                        {/* Left side: FaceCrop, SignatureUpload, Search */}
                        <Box
                            sx={{
                                display: "flex",
                                gap: 1,
                                flexDirection: { xs: "column", md: "row" },
                                width: { xs: "100%", md: "auto" },
                            }}
                        >
                            <Box sx={{ width: { xs: "100%", md: "auto" } }}>
                                <FaceCropModal fullwidth />
                            </Box>

                            <Box sx={{ width: { xs: "100%", md: "auto" } }}>
                                <SignatureUpload fullwidth />
                            </Box>

                            <Box sx={{ width: { xs: "100%", md: "auto" } }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="small"
                                    startIcon={<SearchIcon />}
                                    sx={{ fontWeight: 'bold' }}
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    Search VL
                                </Button>
                            </Box>
                        </Box>

                        {/* Right side: Clear, Cancel, Confirm */}
                        <Box
                            sx={{
                                display: "flex",
                                gap: 1,
                                flexDirection: { xs: "column", md: "row" },
                                width: { xs: "100%", md: "auto" },
                            }}
                        >
                            <Box sx={{ width: { xs: "100%", md: "auto" } }}>
                                <Button fullWidth variant="outlined" color="warning" size="small" onClick={handleClearAll}>
                                    Clear
                                </Button>
                            </Box>

                            <Box sx={{ width: { xs: "100%", md: "auto" } }}>
                                <Button fullWidth variant="contained" color="error" size="small" onClick={handleClose}>
                                    Cancel
                                </Button>
                            </Box>

                            <Box sx={{ width: { xs: "100%", md: "auto" } }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="secondary"
                                    size="small"
                                    disabled={!canConfirm}
                                    onClick={handleConfirm}
                                >
                                    Confirm
                                </Button>
                            </Box>
                        </Box>
                    </DialogActions>

                </Box>
                <VLSearchModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSelect={(vl) => {
                        console.log("Selected VL:", vl);

                        setSelectedVL(vl); // store the selected VL in state
                        const paddedId = String(vl.idnum || "").padStart(6, "0");
                        setIdNumber(paddedId);                        

                        // Set Full Name
                        if (singleFullNameRef.current) singleFullNameRef.current.value = vl.fullname.toUpperCase();

                        // Set Street / Address
                        setStreetAddress(vl.address?.toUpperCase() || "");

                        // Normalize function to avoid mismatches
                        const brgyCode = BARANGAYS.find((b) => {
                            // Normalize both BARANGAY and BRGY prefixes
                            const normalize = (name: string) =>
                                name.replace(/^(BRGY\.?|BARANGAY)\s*/i, "").trim().toUpperCase();

                            const normalizedBName = normalize(b.name);
                            const normalizedVLBrgy = normalize(vl.brgy || "");

                            return normalizedBName === normalizedVLBrgy;
                        })?.code;

                        setBarangayCode(brgyCode || "");


                        // Ensure single field mode
                        setNameFormat("single");
                    }}
                />




            </Dialog>


        </>
    );
}
