import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";

type RequestInterceptor = (
  config: InternalAxiosRequestConfig,
  type?: "jwt" | "token",
  confirm?: Function
) => Promise<InternalAxiosRequestConfig>;

type ResponseInterceptor = (
  response: AxiosResponse,
  confirm?: Function
) => Promise<AxiosResponse>;

export type { RequestInterceptor, ResponseInterceptor };
