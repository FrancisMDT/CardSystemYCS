"use client";

import React, { createContext, useContext } from "react";
import { uploadImage } from "../services/imageServices/uploadService";

type UploadContextType = {
    saveUserImage: (image: string, filename?: string) => Promise<void>;
    saveSignature: (image: string, filename?: string) => Promise<void>;
};

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export const UploadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const saveUserImage = async (image: string, filename?: string) => {
        await uploadImage(image, "Images", filename);
    };

    const saveSignature = async (image: string, filename?: string) => {
        await uploadImage(image, "Signature", filename);
    };

    return (
        <UploadContext.Provider value={{ saveUserImage, saveSignature }}>
            {children}
        </UploadContext.Provider>
    );
};

export const useUpload = () => {
    const context = useContext(UploadContext);
    if (!context) throw new Error("useUpload must be used within an UploadProvider");
    return context;
};
