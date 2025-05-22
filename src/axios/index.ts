import { api } from './instance';
import {GetFreeMachine} from "../types/requests";
import {AxiosPromise} from "axios";

export const requests = {
  getFreeMachine: async (): AxiosPromise<GetFreeMachine> => await api('get', '/scaler/find-free-machine/minbar'),
};

export type RequestsEnum = keyof typeof requests;
