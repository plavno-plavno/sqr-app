import type { GetFreeMachine } from "@/shared/model/requests";
import { api } from "@/shared/api/instance";
import type { AxiosPromise } from "axios";

export const requests = {
  getFreeMachine: async (): AxiosPromise<GetFreeMachine> =>
    await api("get", "/scaler/find-free-machine/agent"),
};

export type RequestsEnum = keyof typeof requests;
