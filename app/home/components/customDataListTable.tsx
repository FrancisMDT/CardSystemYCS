import React, { useState } from 'react';
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    TablePagination,
} from '@mui/material';

interface SimpleTableProps<T> {
    columns: { accessorKey: keyof T; header: string; renderCell?: (value: any, row: T) => React.ReactNode }[];
    data: T[];
    renderActions?: (row: T) => React.ReactNode;
}

export default function SimpleTable<T>({
    columns,
    data,
    renderActions,
}: SimpleTableProps<T>) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Paper
            sx={{
                borderRadius: 2, // Rounded corners
                boxShadow: 'none', // Remove default shadow
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden', // Prevents overflow on rounded corners
            }}
        >
            <TableContainer>
                <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                    <TableHead>
                        <TableRow>
                            {columns.map((col, index) => (
                                <TableCell
                                    key={String(col.accessorKey)}
                                    sx={{
                                        py: 1,
                                        fontWeight: 'bold',
                                        backgroundColor: 'background.paper',
                                        borderBottom: '2px solid',
                                        borderColor: 'divider',
                                        ...(index === 0 && { borderTopLeftRadius: 8 }),
                                        ...(index === columns.length - 1 && !renderActions && {
                                            borderTopRightRadius: 8,
                                        }),
                                    }}
                                >
                                    {col.header}
                                </TableCell>
                            ))}
                            {renderActions && (
                                <TableCell
                                    sx={{
                                        py: 1,
                                        fontWeight: 'bold',
                                        backgroundColor: 'background.paper',
                                        borderBottom: '2px solid',
                                        borderColor: 'divider',
                                        borderTopRightRadius: 8,
                                    }}
                                >
                                    Actions
                                </TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row, rowIndex) => (
                                <TableRow
                                    key={rowIndex}
                                    hover
                                    sx={{
                                        backgroundColor: 'background.default',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            backgroundColor: 'action.hover',
                                        },
                                    }}
                                >
                                    {columns.map((col) => (
                                        <TableCell key={String(col.accessorKey)} sx={{ py: 0.5 }}>
                                            {col.renderCell
                                                ? col.renderCell(row[col.accessorKey], row)
                                                : String(row[col.accessorKey] ?? "")
                                            }
                                        </TableCell>
                                    ))}
                                    {renderActions && (
                                        <TableCell sx={{ py: 0.5 }}>
                                            {renderActions(row)}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                    backgroundColor: 'background.default',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                }}
            />
        </Paper>
    );
}
