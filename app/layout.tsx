"use client";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import LinearProgress from "@mui/material/LinearProgress";
import React, { useEffect } from "react";
import { Box, CssBaseline } from "@mui/material";
import ThemeProvider from "@/ThemeProvider";
import "../app/assets/globals.css";
import { useRouter, usePathname } from "next/navigation";
import { fetchUsers } from "./services/userServices/fetchUsers";
import DataProviders from "./Contexts/DataProviders";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const userData = await fetchUsers();
  //       // console.log("userDataASDASDASDASD:", userData);
        
  //       const count = userData.filter(user => Array.isArray(user.web_binding)).length;        
  //       if (userData.length > 0) {
  //         router.push("/home");
  //       } else {
  //         router.push("/signin");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching users:", error);
  //       router.push("/signin"); // Redirect if fetch fails
  //     }
  //   };

  //   fetchData();
  // }, []);

  const title = `${process.env.NEXT_PUBLIC_TITLE}`

  

  return (
    <html lang="en" data-toolpad-color-scheme="dark">
      <head>
        <title>{title}</title>
      </head>
      <body>
        <ThemeProvider>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <React.Suspense fallback={<LinearProgress />}>
              <CssBaseline />
              <DataProviders>
              {children}
              </DataProviders>
            </React.Suspense>
          </AppRouterCacheProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
