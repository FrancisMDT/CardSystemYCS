export async function deleteImages(
    YouthID: string
): Promise<{ message: string; deletedFiles: string[] }> {
    if (!YouthID) throw new Error("Missing YouthID");

    const response = await fetch(`/api/youthpics/delete?YouthID=${encodeURIComponent(YouthID)}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to delete images");
    }

    return response.json(); // { message, deletedFiles }
}
