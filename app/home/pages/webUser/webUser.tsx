import {
    Box, Button, Divider, IconButton, InputAdornment, TextField, Tooltip, Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from "@mui/icons-material/Add";
import SimpleTable from "../../components/customDataListTable";
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import { UserSCID } from "@/app/models/UserModel";

export default function WebUser() {

    const columns: {
        accessorKey: keyof UserSCID;
        header: string;
        renderCell?: (value: any, row: Partial<UserSCID>) => React.ReactNode;
    }[] = [
            {
                accessorKey: "Username", // ✅ keyof WebUserAccount
                header: "Full Name",
                renderCell: (value: string) => (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1 }}>
                        <PersonIcon fontSize="small" />
                        <Typography>{value}</Typography>
                    </Box>
                ),
            },
            {
                accessorKey: "Designation",
                header: "Access Level",
                renderCell: (value: string) => (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1 }}>
                        <LockIcon fontSize="small" />
                        <Typography>{value}</Typography>
                    </Box>
                ),
            },
        ];

    const data: Partial<UserSCID>[] = [
        { Username: "Acme Corp", Designation: "Admin" },
        { Username: "Globex Inc", Designation: "User" },
    ];

    const renderActions = (row: Partial<UserSCID>) => (
        <Box>
            <Tooltip title="View" disableInteractive>
                <IconButton onClick={() => console.log("View", row)}>
                    <VisibilityIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title="Edit" disableInteractive>
                <IconButton onClick={() => console.log("Edit", row)}>
                    <EditIcon />
                </IconButton>
            </Tooltip>
        </Box>
    );

    return (
        <Box sx={{ flexDirection: "column", display: "flex", padding: 2, gap: 2 }}>
            <Typography variant="h4" color="text.primary">Manage Web Users</Typography>
            <Divider />
            <Typography variant="body2" color="text.primary">
                View and update web user account details, including names and passwords.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "row", gap: 1, alignItems: "center" }}>
                <Button
                    size="small"
                    variant="contained"
                    color="secondary"
                    sx={{
                        width: "fit-content",
                        whiteSpace: "nowrap",
                        fontWeight: "bold",
                    }}
                    startIcon={<AddIcon />}
                >
                    New Web User
                </Button>
                <TextField
                    placeholder="Search"
                    variant="outlined"
                    type="search"
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {/* Currently Using the table from unbind instead of material react table */}
            <SimpleTable
                columns={columns}
                data={data}
                renderActions={renderActions}
            />
        </Box>
    );
}
