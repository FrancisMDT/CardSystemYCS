import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import LayersIcon from '@mui/icons-material/Layers';
import PublicIcon from '@mui/icons-material/Public';
import GroupsIcon from '@mui/icons-material/Groups';
import type { Navigation } from '@toolpad/core';
import LinkIcon from '@mui/icons-material/Link';
import TaskIcon from '@mui/icons-material/Task';
import PersonIcon from '@mui/icons-material/Person';
import ElderlyIcon from '@mui/icons-material/Elderly';

export const NAVIGATION: Navigation = [
    {
        kind: 'header',
        title: 'Main',
    },
    {
        segment: 'seniorCard',
        title: 'Senior Card',
        icon: <ElderlyIcon />,
    },
    // {
    //     segment: 'dashboard',
    //     title: 'Dashboard',
    //     icon: <DashboardIcon />,
    // },
    // {
    //     segment: 'verification',
    //     title: 'Verification',
    //     icon: <TaskIcon />,
    // },
    // {
    //     kind: 'divider',
    // },
    // {
    //     segment: 'bind',
    //     title: 'Binding',
    //     icon: <LinkIcon />,
    // },
    // {
    //     kind: 'header',
    //     title: 'Admin',
    // },
    
    {
        segment: 'webUser',
        title: 'Create Web User',
        icon: <PersonIcon />,
    },
    // {
    //     segment: 'adminpanel',
    //     title: 'Admin Panel',
    //     icon: <LayersIcon />,
    // },
];