export const renameScidFiles = async (oldScid: string, newScid: string) => {
    const response = await fetch("/api/youthpics/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldScid, newScid }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Failed to rename YouthID files");
    }

    return response.json(); // { success, results }
};
