import { UserDataApiResponse, UserSCID } from "../models/UserModel";

// Save user data (non-sensitive only)
export const saveUserData = (data: UserSCID) => {
	if (typeof window !== "undefined") {
		localStorage.setItem("userData", JSON.stringify(data));
	}
};

// Get user data
export const getUserData = (): UserSCID | null => {
	if (typeof window === "undefined") return null; // 🚫 avoid SSR crash

	const data = localStorage.getItem("userData");
	try {
		return data ? (JSON.parse(data) as UserSCID) : null;
	} catch (error) {
		console.error("Failed to parse user data:", error);
		return null;
	}
};

// Clear user data
export const clearUserData = () => {
	if (typeof window !== "undefined") {
		localStorage.removeItem("userData");
	}
};
