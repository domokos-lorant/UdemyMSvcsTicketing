import axios from "axios";
import { IncomingMessage } from "node:http";
import isServer from "../utils/isServer";

export default function buildClient(req: IncomingMessage | undefined) {
  if (isServer()) {
    return axios.create({
      baseURL:
        "httlp://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: req?.headers,
    });
  } else {
    return axios.create({
      baseURL: "/",
    });
  }
}
