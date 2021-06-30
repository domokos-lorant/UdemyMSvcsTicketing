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
      <div className="container">
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
}

AppComponent.getInitialProps = async ({ ctx, Component }: AppContext) => {
  const { req } = ctx;
  const client = buildClient(req);
  const { data } = await client.get("/api/users/currentuser");
  let pageProps = {};

  if (Component.getInitialProps) {
    // Blah, tried a bit to extend the type but didn't work
    // @ts-ignore
    pageProps = await Component.getInitialProps(ctx, client, data.currentUser);
  }

  return { pageProps, ...data };
};
