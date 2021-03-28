import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import type { AppContext, AppProps } from "next/app";
import buildClient from "../api/build-client";
import type { CurrentUser } from "../types/CurrentUser";
import Header from "../components/header";

type Props = AppProps & CurrentUser;

export default function AppComponent({
  Component,
  pageProps,
  currentUser,
}: Props) {
  return (
    <div>
      <Header currentUser={currentUser} />
      <Component {...pageProps} />
    </div>
  );
}

AppComponent.getInitialProps = async ({ ctx, Component }: AppContext) => {
  const { req } = ctx;
  const client = buildClient(req);
  const { data } = await client.get("/api/users/currentuser");
  let pageProps = {};

  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }

  return { pageProps, ...data };
};
