"use client";
import type * as React from "react";
import { AppProvider } from "@toolpad/core/AppProvider";
import type { AuthResponse, AuthProvider } from "@toolpad/core/SignInPage";
import theme from "../../theme";
import { Box, Button, Paper, TextField, Typography, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserLogOn } from "../services/AuthService";
import { BorderColor } from "@mui/icons-material";
import { useLoading } from "../Contexts/LoadingContext";
import { relative } from "path";
import BgPatternMUI from "../home/components/BgPatternMUI";
import { PrintButton } from "../home/pages/SeniorCP/components/cardPrint";
import { CapturePicture } from "../home/pages/SeniorCP/components/imageCapture";
import { SignatureUpload } from "../home/pages/SeniorCP/components/signatureUpload";
import FaceCropModal from "../home/pages/SeniorCP/components/imageCrop";
import { useUserContext } from "../Contexts/userContext";

const providers = [{ id: "credentials", name: "Username and Password" }];

export default function CredentialsSignInPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const { loading, setLoading } = useLoading();
    const { setUser } = useUserContext();

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                handleSignIn();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [username, password]);

    const handleSignIn = async () => {
        setUsernameError("");
        setPasswordError("");
        setLoading(true);

        let hasError = false;

        if (!username.trim()) {
            setUsernameError("Username is required");
            hasError = true;
        }

        if (!password.trim()) {
            setPasswordError("Password is required");
            hasError = true;
        }

        if (hasError) {
            setLoading(false);
            return;
        }

        try {
            const response = await UserLogOn(username, password);
            console.log("response: ", response);
            setUser(response); // safeUser from API            
            router.push("/home"); // ✅ navigation here
            setLoading(false);
            console.log("Redirect called!");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Login failed.";
            alert(message);
        }
    };
    const localTheme = localStorage.getItem("theme");

    return (
        <AppProvider theme={theme}>
            <BgPatternMUI />
            <Box
                sx={{
                    backgroundColor: "transparent",
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Sign-in card */}
                <Box
                    sx={{
                        backgroundColor: "background.default",
                        zIndex: 1,
                        width: "100%",
                        maxWidth: 400, // fixed max size
                        padding: "2rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        boxShadow: "0px 8px 24px rgba(0,0,0,0.3)",
                        // borderRadius: 2,
                        border: `1px solid ${localTheme === "dark"
                            ? theme.dark.palette.divider
                            : theme.light.palette.divider
                            }`,
                    }}
                >
                    <Box>
                        <Typography variant="h6" textAlign="center" color="text.primary">
                            Sign In
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary" textAlign="center">
                            Welcome, Please Sign In to Continue
                        </Typography></Box>

                    <Box>
                        <TextField
                            // label="Username"
                            variant="outlined"
                            value={username}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                            fullWidth
                            autoFocus
                            error={!!usernameError}
                            helperText={usernameError}
                            sx={{
                                marginBottom: "1rem",
                            }}
                            placeholder="Username"
                        />

                        <TextField
                            // label="Password"
                            type="password"
                            variant="outlined"
                            value={password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            fullWidth
                            error={!!passwordError}
                            helperText={passwordError}
                            sx={{
                                marginBottom: "1.5rem",
                            }}
                            placeholder="Password"
                        />
                    </Box>

                    <Button
                        variant="outlined"
                        onClick={handleSignIn}
                        fullWidth
                        disabled={loading}
                        sx={{
                            padding: "0.8rem",
                            color: "primary.contrastText",
                            backgroundColor: "primary.main",
                            '&:hover': {
                                backgroundColor: "primary.dark",
                            },
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
                    </Button>
                </Box>
            </Box>
        </AppProvider>
    );
}
