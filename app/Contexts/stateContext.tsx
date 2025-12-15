// contexts/stateContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";

type StateContextType = {
    showFilter: boolean;
    setShowFilter: (value: boolean) => void;
    captured: string | null;
    setCaptured: (value: string | null) => void;
    signature: string | null;
    setSignature: (value: string | null) => void;
};

// 1. Create the context
const StateContext = createContext<StateContextType | undefined>(undefined);

// 2. Create the provider
export const StateProvider = ({ children }: { children: ReactNode }) => {
    const [showFilter, setShowFilter] = useState<boolean>(true);
    const [captured, setCaptured] = useState<string | null>(null);
    const [signature, setSignature] = useState<string | null>(null);

    return (
        <StateContext.Provider value={{
            showFilter,
            captured, 
            setCaptured, 
            setShowFilter,
            signature,
            setSignature

        }}>
            {children}
        </StateContext.Provider>
    );
};

// 3. Create a hook to use the context
export const useStateContext = (): StateContextType => {
    const context = useContext(StateContext);
    if (!context) {
        throw new Error("useStateContext must be used within a StateProvider");
    }
    return context;
};
