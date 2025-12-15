export const deleteSCDataService = async (opts: { id?: string; scid?: string }): Promise<void> => {
    if (!opts.id && !opts.scid) {
        throw new Error("Either id or scid must be provided");
    }

    const query = opts.id ? `id=${opts.id}` : `scid=${opts.scid}`;
    const res = await fetch(`/api/scid?${query}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete SCData");
    }
};
