import { makeAutoObservable } from "mobx";
import {
  TEMP_FROM_ADDRESS,
  TEMP_PRIVATE_KEY,
  TEMP_TO_ADDRESS,
  TEMP_WALLET_ID,
} from "../constants";

export default class AppStore {
  rootStore;

  apiKey = process.env.REACT_APP_API_KEY || "";
  apiSecretKey = process.env.REACT_APP_SECRET_KEY || "";
  apiPassphrase = process.env.REACT_APP_PASSPHRASE || "";
  apiProjectId = process.env.REACT_APP_PROJECT_ID || "";

  fromAddress = TEMP_FROM_ADDRESS || "";
  toAddress = TEMP_TO_ADDRESS || "";
  walletId = TEMP_WALLET_ID || "";
  privateKey = TEMP_PRIVATE_KEY || "";

  openSnackBar = false;
  snackBarMessage = "";

  constructor(rootStore) {
    makeAutoObservable(this, { rootStore: false });
    this.rootStore = rootStore;
  }

  setAPIKey = (apiKey) => {
    this.apiKey = apiKey;
  };

  setAPISecretKey = (apiSecretKey) => {
    this.apiSecretKey = apiSecretKey;
  };

  setAPIPassphrase = (apiPassphrase) => {
    this.apiPassphrase = apiPassphrase;
  };

  setAPIProjectId = (apiProjectId) => {
    this.apiProjectId = apiProjectId;
  };

  setFromAddress = (fromAddress) => {
    this.fromAddress = fromAddress;
  };

  setToAddress = (toAddress) => {
    this.toAddress = toAddress;
  };

  setWalletId = (walletId) => {
    this.walletId = walletId;
  };

  setPrivateKey = (privateKey) => {
    this.privateKey = privateKey;
  };

  dispose() {
    this.apiKey = process.env.REACT_APP_API_KEY || "";
    this.apiSecret = process.env.REACT_APP_SECRET_KEY || "";
    this.apiPassphrase = process.env.REACT_APP_PASSPHRASE || "";
    this.apiProjectId = process.env.REACT_APP_PROJECT_ID || "";

    this.fromAddress = TEMP_FROM_ADDRESS || "";
    this.toAddress = TEMP_TO_ADDRESS || "";
    this.walletId = TEMP_WALLET_ID || "";
    this.privateKey = TEMP_PRIVATE_KEY || "";
  }
}
