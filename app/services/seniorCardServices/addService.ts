import { SeniorCardModel } from "@/app/models/SeniorCard/seniorCardModel";

export const addSCDataService = async (data: Partial<SeniorCardModel>): Promise<Partial<SeniorCardModel>> => {
    const res = await fetch("/api/scid", {
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
    return result.data[0];
};

