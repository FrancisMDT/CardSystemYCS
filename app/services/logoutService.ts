export async function logout(): Promise<void> {
    try {
        const res = await fetch("/api/logout", {
            method: "POST",
            credentials: "include", // 🔑 ensures cookies are sent
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || "Logout failed");
        }

        // Optional: clear client-side user data
        localStorage.removeItem("userData"); // if you still store user info locally
    } catch (err) {
        console.error("Logout error:", err);
        throw err;
    }
}