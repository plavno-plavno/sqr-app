import axios, { Method, ResponseType } from 'axios';

export const instance = () => axios.create({
  baseURL: process.env['REACT_APP_BASE_URL'],
});

export const api = <T>(method: Method, urlPoint: string, params?: T, token?: string, responseType: ResponseType = 'json') => instance()
  .request({
    method,
    url: urlPoint,
    data: params,
    responseType: responseType,
  });
