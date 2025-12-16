// /app/services/SCStatusService.ts
import axios from "axios";

interface UpdateStatusPayload {
    youthid: string;
    status: string;
}

export const updateSCStatus = async (payload: UpdateStatusPayload) => {
    try {
        const response = await axios.put("/api/SCStatus", payload);
        return response.data;
    } catch (err: any) {
        console.error("Failed to update SC status:", err);
        throw new Error(err?.response?.data?.message || "Unknown error");
    }
};
