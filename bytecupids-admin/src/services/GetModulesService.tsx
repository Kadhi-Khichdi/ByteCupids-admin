import axios from "axios";
import type { GetModuleResponse } from "../types/GetModuleResponse";

export const getModules = async (): Promise<GetModuleResponse> => {
  try {
    const response = await axios.post(
      "http://localhost:8000/bytecupids/lab/get_modules"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching modules:", error);
    throw error;
  }
};
