"use client";

import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { CssBaseline } from "@mui/material";
import theme from "@/theme"; // Import your theme.ts

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [themeMode, setThemeMode] = useState<"light" | "dark">("light"); // Default to light
    const [mounted, setMounted] = useState(false); // Prevent hydration mismatch

    useEffect(() => {
        const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
        if (storedTheme) {
            setThemeMode(storedTheme);
        }
        setMounted(true); // Now safe to render
    }, []);

    if (!mounted) {
        return null; // Prevent mismatched server/client rendering
    }

    return (
        <MuiThemeProvider theme={theme[themeMode]}>
            <CssBaseline />
            {children}
        </MuiThemeProvider>
    );
}
