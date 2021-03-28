import { NextPageContext } from "next";
import React from "react";
import buildClient from "../api/build-client";
import type { CurrentUser } from "../types/CurrentUser";

export default function Index({ currentUser }: CurrentUser) {
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
