"use client";
import React from "react";
import {
    MaterialReactTable,
    type MRT_ColumnDef,
} from "material-react-table";
import { Box } from "@mui/material";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";

export type MUITableBindingProps<T extends object> = {
    columns: MRT_ColumnDef<T>[];
    data: T[];
    selectedRow: T | null;
    setSelectedRow: React.Dispatch<React.SetStateAction<T | null>>;
    maxHeight?: string;
};


export default function MUITableBinding<T extends object>({
    columns,
    data,
    selectedRow,
    setSelectedRow,
    maxHeight = "400px",
}: MUITableBindingProps<T>) {
    return (
        <Box sx={{ width: "100%", height: "55vh", display: "flex", flexDirection: "column" }}>
            <MaterialReactTable
                columns={columns}
                data={data}
                enableTopToolbar={false}
                enableExpanding={false}
                muiTableBodyRowProps={({ row }) => {
                    const isSelected = selectedRow && row.original === selectedRow;

                    return {
                        onClick: () => {
                            setSelectedRow(isSelected ? null : row.original); // toggle select/unselect
                            console.log("✅ Selected:", row.original);
                        },
                        sx: {
                            cursor: "pointer",
                            backgroundColor: isSelected ? "background.paper" : "background.default",
                            "&:hover": { backgroundColor: "action.hover" },
                            position: "relative",
                        },
                    };
                }}
                displayColumnDefOptions={{
                    "mrt-row-actions": {
                        header: "",
                        Cell: ({ row }) => {
                            const isSelected = selectedRow && row.original === selectedRow;
                            return (
                                <Box sx={{ display: "flex", justifyContent: "center" }}>
                                    {isSelected ? (
                                        <RadioButtonCheckedIcon color="primary" />
                                    ) : (
                                        <RadioButtonUncheckedIcon color="disabled" />
                                    )}
                                </Box>
                            );
                        },
                    },
                }}
                enableStickyHeader
                muiTableContainerProps={{
                    sx: {
                        height: maxHeight,
                        overflowY: "auto",
                        scrollbarWidth: "none", // Firefox
                        "&::-webkit-scrollbar": {
                            display: "none", // Chrome, Safari
                        },
                        bgcolor: "background.default",
                    },
                }}
                muiTableHeadCellProps={{
                    sx: {
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        backgroundColor: "background.default",
                    },
                }}
            // ✅ change footer background
            // muiBottomToolbarProps={{
            //     sx: {
            //         backgroundColor: "background.default",
            //     },
            // }}
            // muiPaginationProps={{
            //     sx: {
            //         backgroundColor: "background.default",
            //     },
            // }}
            />

        </Box>
    );
}