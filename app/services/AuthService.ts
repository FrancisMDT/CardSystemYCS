import type { UserDataApiResponse, UserSCID } from "../models/UserModel";
import { saveUserData } from "./localStorageUtils";

export const UserLogOn = async (
	username: string,
	password: string,
): Promise<UserSCID> => {
	const res = await fetch("/api/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username, password }),
		credentials: "include", // 🔑 make sure cookies are sent & saved
	});

	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error(data.message || "Login failed");
	}

	const data = await res.json();

	// `data` contains { success, user }
	console.log("Login response data:", data);
	const userData: UserSCID = data.user;

	// ✅ Save non-sensitive user info to localStorage (optional)
	saveUserData(userData);

	return userData;
};

// 🚫 No need for getToken anymore — token is in cookie
// Use cookies() (server) or rely on fetch with credentials: "include"

// Logout now just calls your API
// AuthService
export async function logout(): Promise<void> {
	try {
		const res = await fetch("/api/logout", {
			method: "POST",
			credentials: "include", // ensures cookies are sent
		});

		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			throw new Error(data.message || "Logout failed");
		}

		// Clear local user data
		localStorage.removeItem("userData");

		// Redirect client-side
		window.location.href = "/signin";
	} catch (err) {
		console.error("Logout error:", err);
		throw err;
	}
}


