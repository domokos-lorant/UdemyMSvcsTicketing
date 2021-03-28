import { NextPageContext } from "next";
import React from "react";
import buildClient from "../api/build-client";

type Props = {
  currentUser: {
    id: string;
    email: string;
  } | null;
};

export default function Index({ currentUser }: Props) {
  return currentUser ? (
    <h1>You are signed in</h1>
  ) : (
    <h1>You are NOT signed in</h1>
  );
}

Index.getInitialProps = async ({ req }: NextPageContext) => {
  const client = buildClient(req);
  const { data } = await client.get("/api/users/currentuser");
  return data;
};
