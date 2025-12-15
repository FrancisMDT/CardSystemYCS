import type * as React from 'react';
import { styled } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

const AntTabs = styled(Tabs)(({ theme }) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
    '& .MuiTabs-indicator': {
        backgroundColor: theme.palette.primary.main,
    },
}));

const AntTab = styled((props: StyledTabProps) => <Tab disableRipple {...props} />)(
    ({ theme }) => ({
        textTransform: 'none',
        minWidth: 0,
        fontWeight: theme.typography.fontWeightRegular,
        marginRight: theme.spacing(1),
        color: theme.palette.text.primary,
        '&:hover': {
            color: theme.palette.primary.light,
            opacity: 1,
        },
        '&.Mui-selected': {
            color: theme.palette.primary.main,
            fontWeight: theme.typography.fontWeightMedium,
        },
        '&.Mui-focusVisible': {
            backgroundColor: theme.palette.action.focus,
        },
    })
);

interface StyledTabsProps {
    children?: React.ReactNode;
    value: number;
    onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const StyledTabs = styled((props: StyledTabsProps) => (
    <Tabs
        {...props}
        TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
    />
))(({ theme }) => ({
    '& .MuiTabs-indicator': {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    '& .MuiTabs-indicatorSpan': {
        maxWidth: 40,
        width: '100%',
        backgroundColor: theme.palette.primary.dark,
    },
}));

interface StyledTabProps {
    label: string;
}

const StyledTab = styled((props: StyledTabProps) => <Tab disableRipple {...props} />)(
    ({ theme }) => ({
        textTransform: 'none',        
        fontWeight: "bold",
        fontSize: theme.typography.pxToRem(15),
        marginRight: theme.spacing(1),
        color: theme.palette.text.secondary,
        '&.Mui-selected': {
            color: theme.palette.text.primary,
        },
        '&.Mui-focusVisible': {
            backgroundColor: theme.palette.action.hover,
        },
    })
);

interface CustomizedTabsProps {
    value: number;
    setValue: (value: number) => void;
}

export default function CustomizedTabs( { value, setValue }: CustomizedTabsProps ) {     
    const theme = useTheme(); // Get theme

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box>
                <StyledTabs
                    value={value}
                    onChange={handleChange}
                    aria-label="styled tabs example"
                    sx={{
                        backgroundColor: theme.palette.background.default,
                        color: theme.palette.text.primary,
                    }}
                >
                    <StyledTab label="User" />
                    <StyledTab label="Scope" />
                    <StyledTab label="Address" />
                    <StyledTab label="Survey" />
                    <StyledTab label="ZipCode" />
                    <StyledTab label="Jobs" />
                    <StyledTab label="Sector" />
                    <StyledTab label="Programs" />
                </StyledTabs>
            </Box>
        </Box>
    );
}
