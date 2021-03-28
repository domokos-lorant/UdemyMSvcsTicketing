import Router from "next/router";
import React, { FormEvent, useState } from "react";
import useRequest from "../../hooks/use-request";

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { doRequest, errors } = useRequest({
    url: "/api/users/signin",
    method: "post",
    body: {
      email,
      password,
    },
  });

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const response = await doRequest();

    if (response.isSuccessfull) {
      Router.push("/");
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h1>Sign In</h1>
      <div className="form-group">
        <label>Email Address</label>
        <input
          value={email}
          className="form-control"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input
          value={password}
          className="form-control"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {errors}
      <button type="submit" className="btn btn-primary">
        Sign In
      </button>
    </form>
  );
}
