import type { } from "@mui/material/themeCssVarsAugmentation";
import type { ThemeOptions, PaletteMode } from "@mui/material/styles";
import { getDesignTokens } from "./themePrimitives";
import { inputsCustomizations, navigationCustomizations } from "./customizations";

export default function getMPTheme(mode: PaletteMode): ThemeOptions {
  return {
    ...getDesignTokens(mode),
    typography: {
      fontFamily: "'Geist', sans-serif",
    },
    components: {
      ...inputsCustomizations,
      ...navigationCustomizations,
      MuiTypography: {
        styleOverrides: {
          root: {
            fontFamily: "'Geist', sans-serif !important",
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          "@font-face": {
            fontFamily: "Geist",
            src: "url('/fonts/Geist-Regular.woff2') format('woff2')",
            fontWeight: "normal",
            fontStyle: "normal",
            fontDisplay: "swap",
          },
          body: {
            fontFamily: "'Geist', sans-serif !important",
          },
        },
      },
    },
  };
}
