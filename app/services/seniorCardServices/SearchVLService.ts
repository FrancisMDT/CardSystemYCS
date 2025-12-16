import { VLSearchResult } from "@/app/models/SeniorCard/youthCardModel";

export const searchVLService = async (query: string): Promise<VLSearchResult[]> => {
    if (!query.trim()) return [];

    try {
        const res = await fetch(`/api/searchVL?search=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("Failed to fetch VL data");

        const data = await res.json();

        // Map to only the columns you want
        return data?.data?.map((item: any) => ({
            idnum: item.idnum,
            fullname: item.fullname,
            address: item.address,
            brgy: item.brgy,
        })) || [];
    } catch (err) {
        console.error("Error searching VL data:", err);
        return [];
    }
};
