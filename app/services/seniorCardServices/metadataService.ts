// services/scidMetadataService.ts
export async function fetchSCIDMetadata(): Promise<{ success: boolean; hasIdColumn: boolean }> {
    try {
        const res = await fetch("/api/scid/metadata");
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Failed to fetch SCID metadata:", err);
        return { success: false, hasIdColumn: false };
    }
}
