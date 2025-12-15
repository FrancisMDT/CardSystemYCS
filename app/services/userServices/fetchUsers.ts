import type { UsersAPIResponse, UserSCID } from "@/app/models/UserModel";
import axios, { type AxiosError } from "axios";

const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${process.env.NEXT_PUBLIC_BACKEND_PORT}`;


export const fetchUsers = async (): Promise<UserSCID[]> => {
  const path = "/api/protected/all_web_account"; 

  const config = {
    headers: {      
      "Content-Type": "application/json",
    },
    validateStatus: () => true, // ✅ Treat ALL status codes as "okay"
  };

  const response = await axios.get(apiUrl + path, config);

  if (response.status >= 400) {
    console.log("⚠️ Ignore this if you are not logged in yet.");
    return [];
  }

  // console.log(response.data[0]?.data);
  return response.data[0]?.data || [];
};

