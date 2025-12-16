import React from "react";
import { TextField } from "@mui/material";

interface InputFieldOptions {
    label: string;
    value: string;
    onChange?: (val: string) => void;
    readOnly?: boolean;
    forceUppercase?: boolean;
    multiline?: boolean;
    rows?: number;
}

export const inputField = ({
    label,
    value,
    onChange,
    readOnly = false,
    forceUppercase = false,
    multiline = false,
    rows,
}: InputFieldOptions) => (
    <TextField
        label={label}
        value={value}
        onChange={
            onChange
                ? (e) => {
                    const input = e.target;
                    let val = input.value;

                    // Preserve cursor
                    const start = input.selectionStart;
                    const end = input.selectionEnd;

                    if (forceUppercase) val = val.toUpperCase();

                    onChange(val);

                    // Restore cursor position
                    setTimeout(() => {
                        input.setSelectionRange(start, end);
                    }, 0);
                }
                : undefined
        }
        fullWidth
        multiline={multiline}
        rows={rows}
        InputProps={{
            readOnly,
            sx: forceUppercase ? { textTransform: "uppercase" } : undefined, // apply to the input element
        }}
        InputLabelProps={label === "Birthdate" ? { shrink: true } : undefined}
        type={label === "Birthdate" ? "date" : "text"}
    />
);
