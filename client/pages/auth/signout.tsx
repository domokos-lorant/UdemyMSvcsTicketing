import Router from "next/router";
import React, { useEffect } from "react";
import useRequest from "../../hooks/use-request";

export default function Signout() {
  const { doRequest } = useRequest({
    url: "/api/users/signout",
    method: "post",
    body: {},
  });

  useEffect(() => {
    (async () => {
      const response = await doRequest();

      if (response.isSuccessfull) {
        Router.push("/");
      }
    })();
  }, []);

  return <div>Signing you out...</div>;
}
