"use client";

import React, { useState, useMemo } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
} from "@mui/material";
import { useSeniorCardDataContext } from "@/app/Contexts/CardContext";
import MUITableBinding from "../components/MUITable";
import PersonIcon from '@mui/icons-material/Person';
import NumbersIcon from '@mui/icons-material/Numbers';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { VLSearchResult } from "@/app/models/SeniorCard/youthCardModel";

interface VLSearchModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (rowData: any) => void; // handler to set selected VL data
}

export default function VLSearchModal({ open, onClose, onSelect }: VLSearchModalProps) {
    const { searchVLData, vlData, setVLData } = useSeniorCardDataContext();
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any | null>(null);

    // Table columns
    const columns: {
        accessorKey: keyof VLSearchResult;
        header: string;
        renderCell?: (value: any, row: Partial<VLSearchResult>) => React.ReactNode;
    }[] = [
            {
                accessorKey: "idnum",
                header: "SC ID",
                renderCell: (value: string) => (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1 }}>
                        <NumbersIcon fontSize="small" />
                        <Typography>{value}</Typography>
                    </Box>
                ),
            },
            {
                accessorKey: "fullname",
                header: "Full Name",
                renderCell: (value: string) => (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1 }}>
                        <PersonIcon fontSize="small" />
                        <Typography>{value}</Typography>
                    </Box>
                ),
            },
            {
                accessorKey: "address",
                header: "Address",
                renderCell: (value, row) => (
                    <Box display="flex" alignItems="center" gap={1}>
                        {value === "PRINTED" ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                        <Typography variant="body2">{value}</Typography>
                    </Box>
                ),
            },
               {
                accessorKey: "brgy",
                header: "Barangay",
                renderCell: (value, row) => (
                    <Box display="flex" alignItems="center" gap={1}>
                        {value === "PRINTED" ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                        <Typography variant="body2">{value}</Typography>
                    </Box>
                ),
            }
        ];

    const handleSearch = async (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" && query.trim()) {
            setLoading(true);
            await searchVLData(query);
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        if (selectedRow) {
            onSelect(selectedRow);

            setQuery("");
            setSelectedRow(null);
            setVLData([]);

            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md"
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
            }}>
             <Box sx={{ bgcolor: "background.default", p: { xs: 2, md: 3 } }}>
            <DialogTitle>Search VL Data</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                    label="Search VL"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    fullWidth
                    size="small"
                />

                {vlData && vlData.length > 0 ? (
                    <MUITableBinding
                        columns={columns}
                        data={vlData}
                        selectedRow={selectedRow}
                        setSelectedRow={setSelectedRow}
                        maxHeight="400px"
                    />
                ) : (
                    <Typography variant="caption" color="text.secondary">
                        {loading ? "Searching..." : "Press Enter to search."}
                    </Typography>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="error" size="small">
                    Cancel
                </Button>
                <Button onClick={handleConfirm} color="primary" size="small" disabled={!selectedRow}>
                    Select
                </Button>
            </DialogActions>
            </Box>
        </Dialog>
    );
}
