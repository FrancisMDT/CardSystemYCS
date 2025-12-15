// LoadingContext.tsx
import type React from "react";
import { createContext, useContext, useState, type ReactNode } from "react"
import { Modal, Box, CircularProgress, Typography, Dialog, DialogContent } from "@mui/material";

// Create a context with the shape of loading state and functions
interface LoadingContextType {
    loading: boolean;
    setLoading: (value: boolean) => void;
}

// Initialize context with a default value
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Custom hook to use the LoadingContext
export const useLoading = (): LoadingContextType => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
};

// Provider component
interface LoadingProviderProps {
    children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
    const [loading, setLoading] = useState(false); // Manage loading state

    const handleModalClose = () => setLoading(false); // Optional close handler

    return (
        <LoadingContext.Provider value={{ loading, setLoading }}>
            {children}
            <Dialog open={loading} onClose={handleModalClose}
                PaperProps={{
                    sx: {
                        bgcolor: "background.default", // exact theme color
                        borderRadius: 3,
                        boxShadow: "none",             // remove shadow/overlay
                        border: "1px solid rgba(0,0,0,0.1)",
                        justifyContent: "center",
                    },
                }}
                BackdropProps={{
                    sx: {
                        backgroundColor: "rgba(0,0,0,0.6)",
                        backdropFilter: "blur(4px)",
                    },
                }}>
                    <Box sx={{ bgcolor: "background.default"}}>
                    <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>                        
                    <CircularProgress />
                    <Typography variant="body1">Loading...</Typography>            
                </DialogContent>
                </Box>
            </Dialog>
        </LoadingContext.Provider>
    );
};
