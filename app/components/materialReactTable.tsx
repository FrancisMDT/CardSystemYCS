import type React from "react";
import { useMemo, useState, useCallback } from "react";
import {
    useMaterialReactTable,
    MaterialReactTable,
    type MRT_ColumnDef,
    type MRT_RowData,
    type MRT_Cell,
    type MRT_TableInstance,
    type MRT_RowSelectionState,
    type MRT_Row,
} from "material-react-table";
import { Box, type SxProps, type Theme } from "@mui/material";
import type { InputProps as MUIInputProps } from "@mui/material/Input";
import { ClearIcon } from "@mui/x-date-pickers";

interface MaterialReactTableComponentProps<T extends MRT_RowData> {
    columns: MRT_ColumnDef<T>[];
    data: T[];
    enableColumnPinning?: boolean;
    initialPinnedColumns?: { left?: string[]; right?: string[] };
    muiTableContainerProps?: {
        sx?: SxProps<Theme>;
    };
    renderTopToolbarCustomActions?: (props: {
        table: MRT_TableInstance<T>;
    }) => React.ReactNode;
    layoutMode?: "grid-no-grow" | "semantic" | "grid" | undefined;
    enableCellClick?: boolean;
    diffPageSize?: number;
    onCellClick?: (rowData: T, columnId: string) => void;
    enableRowActions?: boolean;
    enableRowSelection?: boolean;
    onRowSelectionChange?: (selectedRow: T | null) => void;
    enableRowSelectionOnClick?: boolean;
    onHeaderClick?: (columnId: string) => void;
    headerMultiSelect?: boolean; // New prop for controlling multi-select
    headerSelection?: boolean; // New prop for controlling header selection
    selectedHeaders?: (keyof T)[];
    onGlobalFilterChange?: (filterValue: string) => void;
    muiSearchTextFieldProps?: {
        sx?: SxProps<Theme>; // Optional styling prop
        InputProps?: MUIInputProps; // Optional input props
    };
    renderRowActions?: (props: {
        row: MRT_Row<T>;
    }) => React.ReactNode;
    setSelectedHeaders?: React.Dispatch<
        React.SetStateAction<(keyof T)[]>
    >;

    renderRowActionMenuItems?: (props: {
        closeMenu: () => void;
        row: MRT_Row<T>;
        table: MRT_TableInstance<T>;
    }) => React.ReactNode[];
}

const MaterialReactTableComponent = <T extends MRT_RowData>({
    columns,
    data,
    enableColumnPinning = true,
    initialPinnedColumns = { left: [], right: [] },
    renderTopToolbarCustomActions,
    layoutMode,
    enableRowActions = false,
    enableCellClick = false,
    enableRowSelection = false,
    onRowSelectionChange,
    onCellClick,
    onHeaderClick, // Added prop
    diffPageSize = 15,
    enableRowSelectionOnClick = false,
    headerMultiSelect = false,
    headerSelection = false,
    selectedHeaders = [],
    setSelectedHeaders = () => { }, // Default to a no-op function
    renderRowActionMenuItems,
    renderRowActions,
    onGlobalFilterChange = () => { },
    muiSearchTextFieldProps = {},
    muiTableContainerProps = {
        sx: {
            maxHeight: {
                sm: "calc(100vh - 220px)",
                md: "calc(100vh - 220px)",
                lg: "calc(100vh - 220px)",
            },
            width: "100%", // Ensures it fits the parent container
            overflowY: "auto", // Enables scrolling when content exceeds maxHeight
            border: "none",
        },
    },
}: MaterialReactTableComponentProps<T>) => {
    // const [selectedHeaders, setSelectedHeaders] = useState<(keyof T)[]>([]);
    // Memoized callback for toggling header selection
    const toggleHeaderSelection = useCallback(
        (columnId: keyof T) => {
            if (!headerSelection) return;

            setSelectedHeaders((currentSelection) => {
                const key = columnId;

                let updatedSelection: (keyof T)[] = [];
                if (!headerMultiSelect) {
                    updatedSelection = currentSelection.includes(key) ? [] : [key];
                } else {
                    updatedSelection = currentSelection.includes(key)
                        ? currentSelection.filter((id) => id !== key)
                        : [...currentSelection, key];
                }

                return updatedSelection;
            });

            // onHeaderClick?.(columnId);
        },
        [headerSelection, headerMultiSelect, setSelectedHeaders],
    );

    const memoizedColumns = useMemo(
        () =>
            columns.map((column) => ({
                ...column,

                Header: () => {
                    const columnId = column.accessorKey as keyof T;
                    const isSelected = selectedHeaders.includes(columnId);

                    // Exempt "Barangay" column from click
                    if (columnId === "barangay") {
                        return <div>{column.header}</div>;
                    }

                    return (
                        <button
                            type="button"
                            style={{
                                cursor: headerSelection ? "pointer" : "default",
                                border: "none",
                                background: "none",
                                padding: "0",
                                font: "inherit",
                                color: isSelected ? "red" : "inherit", // Indicator color
                                fontWeight: "bold", // Indicator style
                                textOverflow: "ellipsis", // Add this line
                                overflow: "hidden", // Add this line
                                whiteSpace: "nowrap", // Add this line
                            }}
                            onClick={() => toggleHeaderSelection(columnId)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    toggleHeaderSelection(columnId);
                                }
                            }}
                            aria-label={`Sort by ${column.header}`}
                            disabled={!headerSelection} // Disable if header selection is off
                        >
                            {column.header}
                        </button>
                    );
                },

                Cell: ({ cell }: { cell: MRT_Cell<T> }) => {
                    // Define common styles for all cells
                    const commonStyles = {
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        // backgroundColor: "#f5f5f5", // Default background color for all cells
                        // padding: "4px", // Optional: Add padding for better visibility
                        borderRadius: "4px", // Optional: Add border radius for styling
                        minHeight: "24px", // Set a minimum height for cells
                        display: 'flex', // Use flexbox for vertical alignment
                        alignItems: 'center', // Center vertically
                    };

                    // Exempt "Barangay" column from click
                    if (cell.column.id === "Barangay") {
                        return <Box sx={commonStyles}>{cell.getValue() as React.ReactNode}</Box>;
                    }

                    return (
                        <Box
                            sx={{
                                ...commonStyles, // Spread common styles
                                cursor: enableCellClick ? "pointer" : "default", // Change cursor based on enableCellClick
                            }}
                            onClick={() => enableCellClick && onCellClick?.(cell.row.original, cell.column.id ?? "")}
                            onKeyDown={(e) => {
                                if (enableCellClick && (e.key === "Enter" || e.key === " ")) {
                                    onCellClick?.(cell.row.original, cell.column.id ?? "");
                                }
                            }}
                        >
                            {cell.getValue() as React.ReactNode}
                        </Box>
                    );
                },

            })),
        [
            columns,
            enableCellClick,
            onCellClick,
            selectedHeaders,
            toggleHeaderSelection,
            headerSelection,
        ],
    );

    const [searchValue, setSearchValue] = useState<string>("");

    const handleSearchChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const upperCaseValue = e.target.value.toUpperCase(); // Convert to uppercase
        setSearchValue(upperCaseValue); // Update the controlled input state
        onGlobalFilterChange(upperCaseValue); // Call the global filter change handler
    };

    const handleClearSearch = () => {
        setSearchValue(""); // Reset the search value state
        onGlobalFilterChange(""); // Clear the filter
    };

    const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

    const memoizedData = useMemo(() => data, [data]);
    const memoizedEnableColumnPinning = useMemo(
        () => enableColumnPinning,
        [enableColumnPinning],
    );
    const memoizedInitialPinnedColumns = useMemo(
        () => initialPinnedColumns,
        [initialPinnedColumns],
    );
    const memoizedRenderTopToolbarCustomActions = useMemo(
        () => renderTopToolbarCustomActions,
        [renderTopToolbarCustomActions],
    );

    const table = useMaterialReactTable({
        columns: memoizedColumns,
        data: memoizedData,
        enableColumnPinning: memoizedEnableColumnPinning,

        positionGlobalFilter: 'right',
        initialState: {
            columnPinning: {
                left: memoizedInitialPinnedColumns.left ?? [],
                right: memoizedInitialPinnedColumns.right ?? [],
            },
            density: "compact",
            pagination: {
                pageIndex: 0,
                pageSize: diffPageSize,
            },
            showGlobalFilter: true,
        },
        renderTopToolbarCustomActions: memoizedRenderTopToolbarCustomActions,
        renderRowActionMenuItems: renderRowActionMenuItems,
        renderRowActions: renderRowActions,
        layoutMode,
        enableColumnActions: false,
        enableRowActions: enableRowActions,
        enableMultiRowSelection: false,
        enableRowSelection: enableRowSelection,
        enableColumnResizing: true,
        positionActionsColumn: "last",
        enableStickyHeader: true,
        enableStickyFooter: true,
        positionToolbarAlertBanner: "bottom",
        paginationDisplayMode: "pages",
        enableDensityToggle: false,
        onGlobalFilterChange,

        // state: { rowSelection },
        muiTableContainerProps: muiTableContainerProps,
        muiTableBodyProps: {
            sx: {
                // flex: "1 1 auto",
                // width: "100%", // Ensures it stretches properly
                // minWidth: "100%", // Ensures all columns fit                
                overflowY: "auto",
                // zIndex: 1,
            },
        },
        muiTopToolbarProps: { sx: { backgroundColor: 'background.default', paddingBottom: "8px" } },
        muiBottomToolbarProps: { sx: { backgroundColor: 'background.default' } },

        // muiTableBodyRowProps: ({ row }) => ({
        //     onClick: enableRowSelectionOnClick ? row.getToggleSelectedHandler() : undefined, // Apply click handler only if row selection is enabled
        //     sx: {
        //         // cursor: enableRowSelectionOnClick ? "pointer" : "default", // Change cursor based on row selection                
        //         // backgroundColor: 'background', // Always set background color for the row                                                
        //     },
        // }),

        // muiLinearProgressProps: ({ isTopToolbar }) => ({
        //     color: 'warning',
        //     sx: { display: isTopToolbar ? 'block' : 'none' }, //only show top toolbar progress bar
        //     // value: 1, //show precise real progress value if you so desire
        // }),

        // muiToolbarAlertBannerProps: 
        //      {
        //         color: 'error',
        //         children: 'Network Error. Could not fetch data.',
        //     },
           
        // state: {
        //     // showAlertBanner: true,
        //     showProgressBars: true,
        // },
        muiTableBodyRowProps: { sx: { backgroundColor: 'background.default', }},
        muiTableHeadCellProps: { sx: { backgroundColor: 'background.default', } },
        muiSearchTextFieldProps: {
            ...muiSearchTextFieldProps, // Spread any other custom props passed
            value: searchValue, // Bind value to the state
            onChange: handleSearchChange, // Handle input changes
            InputProps: {
                ...muiSearchTextFieldProps.InputProps, // Spread existing InputProps
                endAdornment: (
                    <>
                        {
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                style={{
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    padding: "6px",
                                    color: "gray", // Set color of the clear button
                                }}
                                aria-label="Clear search"
                            >
                                <ClearIcon />
                            </button>
                        }
                    </>
                ),
            },
            sx: { textTransform: "uppercase" }, // Optional: Make text transform uppercase visually            
        },

        muiTableProps: {
            sx: {
                border: "none",
                // overflow: "hidden",
                maxHeight: "50vh",
            },
        },
        muiPaginationProps: {
            rowsPerPageOptions: [5, 10, 12, 15]
        }
    });

    return (
        <MaterialReactTable table={table} />
    );
};

export default MaterialReactTableComponent;
