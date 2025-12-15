import type React from "react";
import { createContext, useState, useContext } from "react";
import { Alert, Snackbar } from "@mui/material";

// Define the type for Snackbar severity
type AlertSeverity = "success" | "error" | "info" | "warning";

interface SnackbarContextType {
    showSnackBar: (message: string, severity?: AlertSeverity) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [open, setOpen] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [alertSeverity, setAlertSeverity] = useState<AlertSeverity | undefined>("info");

    const showSnackBar = (msg: string, severity: AlertSeverity = "info") => {
        setMessage(msg);
        setAlertSeverity(severity); // Set the alert severity
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <SnackbarContext.Provider value={{ showSnackBar }}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={3000} // Snackbar disappears after 3 seconds
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={handleClose} severity={alertSeverity}>
                    {message}
                </Alert>
            </Snackbar>
        </SnackbarContext.Provider>
    );
};

export const useSnackBar = () => {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error("useSnackBar must be used within a SnackbarProvider");
    }
    return context;
};
