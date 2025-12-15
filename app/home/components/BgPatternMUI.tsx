// components/BgPatternMUI.tsx
import { Box, Typography, useTheme } from "@mui/material";

const BgPatternMUI = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    return (
        <Box
            sx={{
                position: "absolute",
                inset: 0, // fills parent / screen
                zIndex: 0,
                overflow: "hidden",
                background: isDark
                    ? "linear-gradient(to right, #0f172a, #1e293b)"
                    : "linear-gradient(to right, #c9d6ff, #5b8cd9)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                pl: { xs: 2, md: 6 },
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%", // fill outer box
                    height: "100%", // fill outer box
                    transform: "rotate(-20deg) translateX(-5%)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    pointerEvents: "none",
                    userSelect: "none",
                    zIndex: 0,
                }}
            >
                {Array(20) // enough lines to cover screen diagonally
                    .fill(null)
                    .map((_, i) => (
                        <Typography
                            key={i}
                            variant="h1"
                            sx={{
                                fontWeight: 900,
                                fontSize: { xs: "16vw", md: "10vw" }, // scales with screen width
                                color: isDark ? "white" : "#1e293b",
                                lineHeight: 1,
                                opacity: isDark ? 0.08 : 0.06,
                                whiteSpace: "nowrap",
                                marginBottom: "-1rem",
                            }}
                        >
                            {"CARD PRINTING ".repeat(5)}
                        </Typography>
                    ))}
            </Box>
        </Box>



    );
};

export default BgPatternMUI;
