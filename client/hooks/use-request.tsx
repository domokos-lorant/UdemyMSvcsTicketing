import axios, { Method } from "axios";
import React, { useState } from "react";

type Props = {
  url: string;
  method: Method;
  body: { [key: string]: string };
};

export default function useRequest({ url, method, body }: Props) {
  const [errors, setErrors] = useState<React.ReactElement | null>(null);

  const doRequest = async () => {
    setErrors(null);

    try {
      const response = await axios.request({ url, method, data: body });
      return response.data;
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
      return null;
    }
  };

  return { doRequest, errors };
}
