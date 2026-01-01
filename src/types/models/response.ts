export interface IResponse {
  status: number,
  message: string,
  error?: string,
}

export interface IResponseError {
  meta: {
    status: number;
    message: string;
    error: string;
  }
}