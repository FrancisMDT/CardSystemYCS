"use client";

import { Stack, Typography, Chip, Tooltip, Box } from "@mui/material";
import CloudCircleIcon from '@mui/icons-material/CloudCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const status = `${process.env.NEXT_PUBLIC_STATUS }`
const abbreviation = `${process.env.NEXT_PUBLIC_ABBREVIATION }`

export default function CustomAppTitle() {
    return (
        <Stack direction="row" alignItems="center" spacing={2}>
            {/* <LocationOnIcon fontSize="large" color="primary" /> */}
            {/* <Box sx={{ display: 'flex', paddingLeft: 2 }}><img src="/tagme.svg" alt="Logo" width={30} height={30} /></Box> */}
            <Typography variant="h6">{abbreviation}</Typography>
            <Chip size="small" label={status} color="info" />
            <Tooltip title="Connected to production">
                <CheckCircleIcon color="success" fontSize="small" />
            </Tooltip>
        </Stack>
    );
}