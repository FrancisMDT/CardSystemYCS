import React, { createContext, useContext } from "react";
import CryptoJS from "crypto-js";

interface EncryptionContextType {
    encryptData: (data: string) => string;
    compareData: (cipher: string) => string | null;
}

const SECRET_KEY = process.env.NEXT_PUBLIC_CRYPTO_SECRET || "supersecret";

const EncryptionContext = createContext<EncryptionContextType | undefined>(undefined);

export const EncryptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    // Encrypt data using AES
    const encryptData = (data: string) => {
        return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
    };

    // Decrypt data
    const compareData = (cipher: string) => {
        try {
            const bytes = CryptoJS.AES.decrypt(cipher, SECRET_KEY);
            const original = bytes.toString(CryptoJS.enc.Utf8);
            return original || null;
        } catch (error) {
            console.error("Decryption failed", error);
            return null;
        }
    };

    return (
        <EncryptionContext.Provider value={{ encryptData, compareData }}>
            {children}
        </EncryptionContext.Provider>
    );
};

// Hook to use the context
export const useEncryption = () => {
    const context = useContext(EncryptionContext);
    if (!context) {
        throw new Error("useEncryption must be used within an EncryptionProvider");
    }
    return context;
};
