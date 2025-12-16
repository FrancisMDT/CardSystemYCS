import { YouthCardModel } from "@/app/models/SeniorCard/youthCardModel";


export const addSCDataService = async (data: Partial<YouthCardModel>): Promise<Partial<YouthCardModel>> => {
    const res = await fetch("/api/youthid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
        // Use the message sent by backend if it exists
        throw new Error(result.message || "Failed to add SCData");
    }

    console.log("result from API:", result);
    return result.data;
};

