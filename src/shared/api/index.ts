import { api } from "@/shared/api/instance";
import type { GetFreeMachineResponse } from "@/shared/model/machine";
import type { AxiosPromise } from "axios";

export const requests = {
  getFreeMachine: async (): AxiosPromise<GetFreeMachineResponse> =>
    await api("get", "/scaler/find-all-machine/crew"),
};

export type RequestsEnum = keyof typeof requests;
