import axios, { Method } from "axios";
import React, { useState } from "react";

type Props = {
  url: string;
  method: Method;
  body: { [key: string]: string };
};

type Response<TData> = {
  data: TData | null;
  isSuccessfull: boolean;
};

export default function useRequest<TData>({ url, method, body }: Props) {
  const [errors, setErrors] = useState<React.ReactElement | null>(null);

  const doRequest = async (): Promise<Response<TData>> => {
    setErrors(null);

    try {
      const response = await axios.request<TData>({ url, method, data: body });
      return { data: response.data, isSuccessfull: true };
    } catch (error) {
      setErrors(
        <div className="alert alert-danger">
          <h4>Oups...</h4>
          <ul>
            {error.response.data.errors.map((err: { message: string }) => (
              <li key={err.message}>{err.message}</li>
            ))}
          </ul>
        </div>,
      );
      return { data: null, isSuccessfull: false };
    }
  };

  return { doRequest, errors };
}
