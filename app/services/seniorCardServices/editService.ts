import { SeniorCardModel } from "@/app/models/SeniorCard/seniorCardModel";

export const editSCDataService = async (data: Partial<SeniorCardModel>): Promise<Partial<SeniorCardModel>> => {
console.log("data: ", data);    
    const res = await fetch("/api/scid", {
        method: "PUT",
        headers: { "Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to edit SCData");
    }

    const result = await res.json();
    return result.data[0];
};
