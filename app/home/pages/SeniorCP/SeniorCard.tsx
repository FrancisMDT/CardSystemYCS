import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Divider, IconButton, InputAdornment, TextField, Tooltip, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import PrintIcon from "@mui/icons-material/Print";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import NumbersIcon from '@mui/icons-material/Numbers';
import PrintDisabledIcon from '@mui/icons-material/PrintDisabled';
import DeleteIcon from '@mui/icons-material/Delete';

import SimpleTable from "../../components/customDataListTable";
import { useSeniorCardDataContext } from "@/app/Contexts/SeniorCardContext";
import { SeniorCardModel } from "@/app/models/SeniorCard/seniorCardModel";
import { PrintButton } from "./components/cardPrint";
import AddSCModal from "./modal/AddSCModal";
import EditSCModal from "./modal/EditSCModal";
import ViewSCModal from "./modal/ViewSCModal";
import { ConfirmationModal } from "./modal/ConfirmationModal";
import CloseIcon from '@mui/icons-material/Close';
import { useStateContext } from "@/app/Contexts/stateContext";

const columns: {
    accessorKey: keyof SeniorCardModel;
    header: string;
    renderCell?: (value: any, row: Partial<SeniorCardModel>) => React.ReactNode;
}[] = [
        {
            accessorKey: "scid",
            header: "SCID",
            renderCell: (value: string) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1 }}>
                    <NumbersIcon fontSize="small" />
                    <Typography>{value}</Typography>
                </Box>
            ),
        },
        {
            accessorKey: "fullName",
            header: "Full Name",
            renderCell: (value: string) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1 }}>
                    <PersonIcon fontSize="small" />
                    <Typography>{value}</Typography>
                </Box>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            renderCell: (value, row) => (
                <Box display="flex" alignItems="center" gap={1}>
                    {value === "PRINTED" ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                    <Typography variant="body2">{value}</Typography>
                </Box>
            ),
        }
    ];

type ModalState = {
    add: boolean;
    edit: boolean;
    view: boolean;
};

export default function SeniorCard() {
    const { searchSCData, SCData, setSelectedSCData, markAsPrinted, revertPrintedStatus, deleteSCData } = useSeniorCardDataContext();
    const { setSignature, setCaptured } = useStateContext();

    const [modals, setModals] = useState<ModalState>({
        add: false,
        edit: false,
        view: false,
    });

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedSCID, setSelectedSCID] = useState<string | null>(null);

    const queryRef = useRef<HTMLInputElement | null>(null);
    const printRef = useRef<{ handlePrint: (rowData: SeniorCardModel) => void }>(null);

    const [query, setQuery] = useState("");

    const handleSearch = async () => {
        await searchSCData(query);
    };

    const handleOpenModal = (type: keyof ModalState, row?: Partial<SeniorCardModel>) => {
        setModals({ add: false, edit: false, view: false, [type]: true });
        if ((type === "edit" || type === "view") && row) {
            setSelectedSCData(row);
        }
    };

    const handleClearImages = () => {
        setSignature("");
        setCaptured("");
    };

    const [revertConfirmOpen, setRevertConfirmOpen] = useState(false);
    const [revertSCID, setRevertSCID] = useState<string | null>(null);

    // Revert handler
    const handleRevertConfirm = async () => {
        if (!revertSCID) return;
        await revertPrintedStatus(revertSCID);
        setRevertConfirmOpen(false);
        setRevertSCID(null);
    };

    const handleCloseModal = (type: keyof ModalState) => {
        setModals(prev => ({ ...prev, [type]: false }));
    };

    const handlePrint = (data: Partial<SeniorCardModel>) => {
        setSelectedSCData(data);
        setTimeout(() => printRef.current?.handlePrint(data as SeniorCardModel), 100);
        // printRef.current?.handlePrint(data as SeniorCardModel);        
    };

    const handleDelete = async () => {
        if (!selectedSCID) return;
        await deleteSCData(selectedSCID);
        setConfirmOpen(false);
        setSelectedSCID(null);
    };

    const handleClearSearch = () => {
        setQuery("");
        handleSearch();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const tag = (document.activeElement?.tagName || "").toLowerCase();
            const isEditable =
                ["input", "textarea"].includes(tag) ||
                document.activeElement?.getAttribute("contenteditable") === "true";

            if (!isEditable) {
                // Open Add modal: Shift + A
                if (e.shiftKey && e.code === "KeyA") {
                    e.preventDefault();
                    setModals(prev => ({ ...prev, add: true }));
                }

                // Clear search: Shift + X
                if (e.shiftKey && e.code === "KeyX") {
                    e.preventDefault();
                    handleClearSearch();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);






    const renderActions = (row: Partial<SeniorCardModel>) => (
        <Box>
            <Tooltip title="View">
                <IconButton onClick={() => handleOpenModal("view", row)}>
                    <VisibilityIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
                <IconButton onClick={() => handleOpenModal("edit", row)}>
                    <EditIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
                <IconButton
                    onClick={() => {
                        setSelectedSCID(row.scid || null);
                        setConfirmOpen(true);
                    }}
                >
                    <DeleteIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title={row.status === "PRINTED" ? "Reprint" : "Print"}>
                <IconButton onClick={() => handlePrint(row)}>
                    <PrintIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title="Revert Print Status">
                <IconButton
                    onClick={() => {
                        setRevertSCID(row.scid || null);
                        setRevertConfirmOpen(true);
                    }}
                >
                    <PrintDisabledIcon />
                </IconButton>
            </Tooltip>
        </Box>
    );

    return (
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h4" color="text.primary">Senior Card Printing</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.primary">
                Manage Senior Card IDs — view details, make updates, and print copies.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center" }}>
                <Button
                    size="small"
                    variant="contained"
                    color="secondary"
                    sx={{ width: "fit-content", whiteSpace: "nowrap", fontWeight: "bold" }}
                    startIcon={<AddIcon />}
                    onClick={() => { handleOpenModal("add"); handleClearImages() }}
                >
                    New SCID
                </Button>
                <TextField
                    value={query}
                    onChange={(e) => setQuery(e.target.value.toUpperCase())}
                    onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                            await handleSearch();
                        }
                        // Detect Ctrl + Backspace
                        if (e.key === "Backspace" && e.ctrlKey) {
                            setQuery("");             // Clear the input
                            await searchSCData("");   // Trigger search with empty string
                        }
                    }}
                    placeholder="Search SCID, Name, or Address"
                    variant="outlined"
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                        endAdornment: query ? (
                            <InputAdornment position="end">
                                <IconButton
                                    size="small"
                                    onClick={async () => {
                                        setQuery("");        // Clear the text field
                                        await searchSCData(""); // Trigger search with empty string
                                    }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ) : null,
                    }}
                />

                <Button variant="contained" onClick={handleSearch}>Search</Button>
            </Box>

            <SimpleTable columns={columns} data={SCData} renderActions={renderActions} />

            {/* Modals */}
            <AddSCModal open={modals.add} onClose={() => handleCloseModal("add")} />
            <EditSCModal open={modals.edit} onClose={() => handleCloseModal("edit")} />
            <ViewSCModal open={modals.view} onClose={() => handleCloseModal("view")} />

            <PrintButton ref={printRef} />

            {/* Confirmation Modal */}
            <ConfirmationModal
                open={confirmOpen}
                title="Delete Senior Card"
                message="Are you sure you want to delete this senior card? This action cannot be undone."
                onConfirm={handleDelete}
                onCancel={() => setConfirmOpen(false)}
                confirmText="Delete"
                cancelText="Cancel"
            />
            <ConfirmationModal
                open={revertConfirmOpen}
                title="Revert Print Status"
                message="Are you sure you want to revert this card's printed status?"
                onConfirm={handleRevertConfirm}
                onCancel={() => setRevertConfirmOpen(false)}
                confirmText="Revert"
                cancelText="Cancel"
            />
        </Box>
    );
}
