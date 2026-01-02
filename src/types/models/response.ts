export interface IResponse<T = unknown> {
  meta: {
    status: number;
    message: string;
    error?: string;
  },
  results: T;
}

export interface IResponseError {
  meta: {
    status: number;
    message: string;
    error: string;
  },
  results: null | [];
}
