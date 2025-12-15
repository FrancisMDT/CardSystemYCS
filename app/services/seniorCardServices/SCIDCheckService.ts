export async function checkSCIDExists(scid: string): Promise<boolean> {
    try {
        const res = await fetch(`/api/scid/checkID?scid=${encodeURIComponent(scid)}`);
        const data = await res.json();
        return data.exists || false;
    } catch (err) {
        console.error("Failed to check SCID:", err);
        return false;
    }
}
