import { GetFreeMachine } from "../models/requests";
import { api } from "./instance";
import { AxiosPromise } from "axios";

export const requests = {
  getFreeMachine: async (): AxiosPromise<GetFreeMachine> =>
    await api("get", "/scaler/find-free-machine/agent"),
};

export type RequestsEnum = keyof typeof requests;
