import axios, { Method } from "axios";
import React, { useState } from "react";

type Props<TData> = {
  url: string;
  method: Method;
  body: { [key: string]: string };
  onSuccess?: (_data: TData) => void;
};

type Response<TData> = {
  data: TData | null;
  isSuccessfull: boolean;
};

export default function useRequest<TData>({
  url,
  method,
  body,
  onSuccess,
}: Props<TData>) {
  const [errors, setErrors] = useState<React.ReactElement | null>(null);

  const doRequest = async (props: any = {}): Promise<Response<TData>> => {
    setErrors(null);

    try {
      const response = await axios.request<TData>({
        url,
        method,
        data: { ...body, ...props },
      });

      if (onSuccess) {
        onSuccess(response.data);
      }

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
