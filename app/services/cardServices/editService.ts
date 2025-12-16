import { YouthCardModel } from "@/app/models/SeniorCard/youthCardModel";


export const editSCDataService = async (data: Partial<YouthCardModel>): Promise<Partial<YouthCardModel>> => {
console.log("data: ", data);    
    const res = await fetch("/api/youthid", {
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
console.log("edit result: ", result);
    return result.data;
};
