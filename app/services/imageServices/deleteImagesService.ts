export async function deleteImages(
    scid: string
): Promise<{ message: string; deletedFiles: string[] }> {
    if (!scid) throw new Error("Missing scid");

    const response = await fetch(`/api/scpics/delete?scid=${encodeURIComponent(scid)}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to delete images");
    }

    return response.json(); // { message, deletedFiles }
}
