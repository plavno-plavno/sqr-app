import type { GetFreeMachine } from "@/shared/models/requests";
import { api } from "@/shared/api/instance";
import type { AxiosPromise } from "axios";

export const requests = {
  getFreeMachine: async (): AxiosPromise<GetFreeMachine> =>
    await api("get", "/scaler/find-free-machine/agent"),
};

export type RequestsEnum = keyof typeof requests;
