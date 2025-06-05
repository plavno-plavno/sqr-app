import axios, { type Method, type ResponseType } from 'axios';
import { CONFIG } from '../models/config';

export const instance = () => axios.create({
  baseURL: CONFIG.API_BASE_URL,
});

export const api = <T>(method: Method, urlPoint: string, params?: T, _token?: string, responseType: ResponseType = 'json') => instance()
  .request({
    method,
    url: urlPoint,
    data: params,
    responseType: responseType,
  });
