import axios from "axios";
import { CONFIG } from "../model/config";

export const apiClient = axios.create({
  baseURL: CONFIG.API_BASE_URL,
});
