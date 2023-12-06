import { sha256 } from "js-sha256";
import { v4 as uuidv4 } from "uuid";

import { HOST_DEV, HOST_PROD, METHOD_POST } from "../constants";

export const getRequestPathWithSearchParams = (path, searchParams) => {
  return `${path}${
    searchParams
      ? `?${Object.entries(searchParams)
          .map((entry) => entry.join("="))
          .join("&")}`
      : ""
  }`;
};

export const getRequestUrl = (path, searchParams) => {
  const host = process.env.NODE_ENV === "development" ? HOST_DEV : HOST_PROD;
  return `${host}${getRequestPathWithSearchParams(path, searchParams)}`;
};

export const headerParams = (
  timestamp,
  method,
  url,
  body = "",
  API_KEY = "",
  PROJECT_ID = "",
  PASSPHRASE = "",
  SECRET_KEY = ""
) => {
  // console.log(timestamp, method, url, body);
  const message =
    method === METHOD_POST
      ? timestamp + method + url + body
      : timestamp + method + url;
  const sha256hmac = sha256.hmac.create(
    SECRET_KEY || process.env.REACT_APP_SECRET_KEY
  );
  const messageHash = sha256hmac.update(message).array();
  const signature = Buffer.from(messageHash).toString("base64");
  return {
    "Content-Type": "application/json",
    "OK-ACCESS-KEY": API_KEY || process.env.REACT_APP_API_KEY,
    "OK-ACCESS-PASSPHRASE": PASSPHRASE || process.env.REACT_APP_PASSPHRASE,
    "OK-ACCESS-PROJECT": PROJECT_ID || process.env.REACT_APP_PROJECT_ID,
    "OK-ACCESS-TIMESTAMP": timestamp,
    "OK-ACCESS-SIGN": signature,
  };
};

export const generateWalletId = () => {
  return uuidv4();
};