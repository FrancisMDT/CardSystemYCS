export async function checkSCIDExists(youthid: string): Promise<boolean> {
    try {
        const res = await fetch(`/api/youthid/checkID?youthid=${encodeURIComponent(youthid)}`);
        const data = await res.json();
        return data.exists || false;
    } catch (err) {
        console.error("Failed to check SCID:", err);
        return false;
    }
}
