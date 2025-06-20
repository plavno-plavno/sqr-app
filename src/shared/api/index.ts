import { apiClient } from "@/shared/api/instance";
import type { FreeMachine } from "@/shared/model/machine";
import type { AxiosPromise, AxiosRequestConfig } from "axios";

export const requests = {
  getFreeMachine: async (
    config?: AxiosRequestConfig
  ): AxiosPromise<FreeMachine> =>
    apiClient.get("/scaler/find-free-machine/crew", config),
};

export type RequestsEnum = keyof typeof requests;
