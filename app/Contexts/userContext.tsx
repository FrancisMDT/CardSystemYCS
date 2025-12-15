import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { getUserData, clearUserData } from "../services/localStorageUtils";
import type { UserSCID, UserSCIDAPIResponse } from "../models/UserModel";

type UserContextType = {
    user: UserSCID | null;
    setUser: (user: UserSCID | null) => void;
    logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserSCID | null>(null);

    useEffect(() => {
        const storedUser = getUserData();
        if (storedUser) setUser(storedUser);
    }, []);

    const logout = () => {
        clearUserData();
        setUser(null);
        localStorage.removeItem("token");
    };

    return <UserContext.Provider value={{ user, setUser, logout }}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within UserProvider");
    return context;
};
