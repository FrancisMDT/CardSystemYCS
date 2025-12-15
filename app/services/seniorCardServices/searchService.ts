import { SeniorCardApiResponse, SeniorCardModel } from "@/app/models/SeniorCard/seniorCardModel";

export const searchSeniorCards = async (query: string): Promise<SeniorCardModel[]> => {
    try {
        const res = await fetch(`/api/scid?query=${encodeURIComponent(query)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include", // 🔑 move it here, not inside headers
        });


        if (!res.ok) {
            console.error("API Error:", res.status, await res.text());
            throw new Error("Failed to fetch Senior Card data.");
        }

        const data: SeniorCardApiResponse = await res.json();
        console.log("data from API:", data);
        return data.data || [];
    } catch (err) {
        console.error("Error in searchSeniorCards:", err);
        return [];
    }
};
