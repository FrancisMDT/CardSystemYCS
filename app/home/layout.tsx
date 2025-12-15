"use client";
import { usePathname } from "next/navigation"; // Next.js router
import { type SidebarFooterProps, DashboardLayout as ToolpadDashboardLayout } from "@toolpad/core/DashboardLayout";
import { NextAppProvider } from "@toolpad/core/nextjs";
import theme from "../../theme";
import { NAVIGATION } from "./navigation";
import { ToolbarAccountOverride } from "./SidebarFooterAccount";
import CustomAppTitle from "./appTitle";
import { useDemoRouter } from "@toolpad/core/internal";
import { type JSX, useEffect } from "react";

// Import pages
// import DashBoard from "./pages/dashboard/dashboard";
// import DataList from "./pages/dataList/datalist";
import { ThemeProvider } from "@emotion/react";
import React from "react";
import { Stack, Divider, MenuList, MenuItem, ListItemIcon, Avatar, ListItemText, CssBaseline, type Theme } from "@mui/material";
import { type AccountPreviewProps, AccountPreview, AccountPopoverFooter, SignOutButton, Account } from "@toolpad/core";
import { useRouter } from "next/navigation"; // Correct hook import


// Define the mapping of paths to components
const PAGE_COMPONENTS: Record<string, () => JSX.Element> = {
    "seniorCard": SeniorCard,
    // "dashboard": DashBoard,
    // "verification": DataList,
    // "bind": Binding,
    "webUser": WebUser
};

function AccountSidebarPreview(props: AccountPreviewProps & { mini: boolean }) {
    const { handleClick, open, mini } = props;
    return (
        <Stack direction="column" p={0}>
            <Divider />
            <AccountPreview
                variant={mini ? 'condensed' : 'expanded'}
                handleClick={handleClick}
                open={open}
            />
        </Stack>
    );
}

export interface Session2 {
    user?: {
        Username?: string | null;
        Designation?: string | null;
        image?: string | null;
    };
}


function SidebarFooterAccountPopover() {
    const [currentSession, setCurrentSession] = React.useState<Session2 | null>(null);

    useEffect(() => {
        const userData = getUserData(); // returns { Username, Designation }
        if (userData) {
            const sessionData = {
                user: {
                    Username: userData.Username,
                    Designation: userData.Designation,
                    image: "", // leave empty if no avatar
                },
            };
            setCurrentSession(sessionData);
        }
    }, []);

    return (
        <Stack direction="column">
            <MenuList>
                <MenuItem
                    component="button"
                    sx={{ justifyContent: 'flex-start', width: '100%', columnGap: 2 }}
                >
                    <ListItemIcon>
                        <Avatar
                            sx={{ width: 32, height: 32, fontSize: '0.95rem', bgcolor: 'background.default' }}
                            src={currentSession?.user?.image ?? ""}
                            alt={currentSession?.user?.Username ?? ''}
                        >
                            {currentSession?.user?.Username?.[0] ?? ""}
                        </Avatar>
                    </ListItemIcon>
                    <ListItemText
                        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                        primary={currentSession?.user?.Username}
                        secondary={currentSession?.user?.Designation}
                        primaryTypographyProps={{ variant: 'body2' }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                    />
                </MenuItem>
            </MenuList>
            <Divider />
            <AccountPopoverFooter>
                <SignOutButton />
            </AccountPopoverFooter>
        </Stack>
    );
}


const createPreviewComponent = (mini: boolean) => {
    function PreviewComponent(props: AccountPreviewProps) {
        return <AccountSidebarPreview {...props} mini={mini} />;
    }
    return PreviewComponent;
};

function SidebarFooterAccount({ mini }: SidebarFooterProps) {
    const PreviewComponent = React.useMemo(() => createPreviewComponent(mini), [mini]);
    return (
        <Account
            slots={{
                preview: PreviewComponent,
                popoverContent: SidebarFooterAccountPopover,
            }}
            slotProps={{
                popover: {
                    transformOrigin: { horizontal: 'left', vertical: 'bottom' },
                    anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
                    // disableAutoFocus: true,
                    slotProps: {
                        paper: {
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: (theme: Theme) =>
                                    `drop-shadow(0px 2px 8px ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.32)'})`,
                                mt: 1,
                                '&::before': {
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    bottom: 10,
                                    left: 0,
                                    width: 10,
                                    height: 10,
                                    bgcolor: 'background.paper',
                                    transform: 'translate(-50%, -50%) rotate(45deg)',
                                    zIndex: 0,
                                },
                            },
                        },
                    },
                },
            }}
        />
    );
}

import { getUserData } from "@/app/services/localStorageUtils"; // adjust the path as needed
import BgPatternMUI from "./components/BgPatternMUI";
// import Binding from "./pages/binding/binding";
import WebUser from "./pages/webUser/webUser";
import SeniorCard from "./pages/SeniorCP/SeniorCard";
import { logout } from "../services/AuthService";
import { useLoading } from "../Contexts/LoadingContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const route = useRouter();
    const pageRouter = useDemoRouter("/seniorCard"); // Toolpad router
    const pathname = usePathname(); // Get current path    

    // Extract the last segment from the URL
    const currentSegment = pageRouter.pathname.split("/").pop() || "seniorCard";

    // Get the correct component based on pathname
    const Component = PAGE_COMPONENTS[currentSegment] || SeniorCard;

    const [currentSession, setCurrentSession] = React.useState<Session2 | null>(null);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        const userData = getUserData();
        if (userData) {
            // Example: Set user session
            const sessionData = ({
                user: {
                    Username: userData.Username,
                    Designation: userData.Designation,
                    image: "", // if exists
                },
            });
            setCurrentSession(sessionData);
        } else {
            route.push('/signin');
        }
    }, []);

    const { loading, setLoading } = useLoading();

    const authentication = React.useMemo(() => ({
        getSession: async () => currentSession,
        signIn: () => {
            route.push('/home'); // optional redirect after sign-in
        },
        signOut: async () => {
            try {
                setLoading(true);
                await logout(); // call your API service
                setCurrentSession(null); // clear local session state
                setLoading(false);
                route.push('/signin');   // redirect to login page
            } catch (err) {
                console.error("Sign out failed:", err);
            }
        },
    }), [route, currentSession]);



    return (
        <NextAppProvider router={pageRouter} navigation={NAVIGATION} authentication={authentication} session={currentSession} theme={theme}>
            <ThemeProvider theme={theme}>                
                <ToolpadDashboardLayout
                    defaultSidebarCollapsed
                    slots={{
                        toolbarAccount: ToolbarAccountOverride,
                        sidebarFooter: SidebarFooterAccount,
                        appTitle: CustomAppTitle,
                    }}
                    sx={{ bgcolor: "background.default", fontFamily: "Geist" }}
                >
                    {/* Dynamically render the correct page */}
                    {/* <BgPatternMUI/> */}
                    <Component />

                </ToolpadDashboardLayout>
            </ThemeProvider>
        </NextAppProvider>
    );
}
