import type { Account, UsersAPIResponse } from "@/app/models/UserModel";
import axios, { type AxiosError } from "axios";

// API URL construction
const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export const UpdateUsers = async (
	data: Partial<Account>,
): Promise<UsersAPIResponse> => {
    const endpoint = "/api/protected/users";
	try {		
		const config = {
			headers: { },
		};
		const response = await axios.put<UsersAPIResponse>(
			`${apiUrl}${endpoint}?user_id=${data.user_id}`,
			data,
			config,
		);
		return response.data;
	} catch (error) {
		handleApiError(error);
		throw error; // Ensure the error is rethrown for handling in the calling code
	}
};

// Error handling
const handleApiError = (error: unknown) => {
	if (axios.isAxiosError(error)) {
		const axiosError = error as AxiosError;
		if (axiosError.response?.data) {
			const errorData = axiosError.response.data as { error: string };
			throw new Error(errorData.error || "API Error occurred");
		}
		throw new Error("API Error occurred");
	}
	throw new Error("Unknown error occurred");
};
