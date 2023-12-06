export const METHOD_GET = "GET";
export const METHOD_POST = "POST";

export const HOST_DEV = "https://beta.okex.org";
export const HOST_PROD = "https://www.okx.com";

export const API_GET_ALL_CHAINS = "/api/v5/waas/blockchain/get-all-chains";
export const API_GET_ALL_COINS = "/api/v5/waas/asset/get-all-coins";

export const API_CREATE_WALLET = "/api/v5/waas/wallet/create-wallet";

export const API_GET_ASSETS = "/api/v5/waas/asset/get-assets";

export const API_GET_TRANSACTIONS = "/api/v5/waas/transaction/get-transactions";
export const API_GET_TRANSACTION_DETAIL =
  "/api/v5/waas/transaction/get-transaction-detail";

export const API_GET_SIGN_INFO = "/api/v5/waas/transaction/get-sign-info";
export const API_GET_UTXO = "/api/v5/waas/transaction/get-utxo";
export const API_GET_UTXO_NFT = "/api/v5/waas/transaction/get-utxo-nft";

export const API_SEND_TRANSACTION = "/api/v5/waas/transaction/send-transaction";
export const API_SEND_TRANSACTION_BATCH =
  "/api/v5/waas/transaction/send-transaction-batch";

export const TICK_NAME = "okex";
export const BRC20_DEPLOY_PARAMS = {
  p: "brc-20",
  op: "deploy",
  tick: TICK_NAME,
};
export const BRC20_MINT_PARAMS = {
  p: "brc-20",
  op: "mint",
  tick: TICK_NAME,
};
export const BRC20_TRANSFER_PARAMS = {
  p: "brc-20",
  op: "transfer",
  tick: TICK_NAME,
};

export const BRC20_TYPE_DEPLOY = "BRC20_DEPLOY";
export const BRC20_TYPE_MINT = "BRC20_MINT";
export const BRC20_TYPE_TRANSFER = "BRC20_TRANSFER";

export const TEMP_FROM_ADDRESS = process.env.REACT_APP_TEMP_FROM_ADDRESS;
export const TEMP_TO_ADDRESS = process.env.REACT_APP_TEMP_TO_ADDRESS;
export const TEMP_WALLET_ID =  process.env.REACT_APP_TEMP_WALLET_ID;
export const TEMP_PRIVATE_KEY = process.env.REACT_APP_TEMP_PRIVATE_KEY;

export const FEE_RATE_MODE = 0; // 0: max, 1: normal
export const IS_SEND_TRANSACTION_BATCH_ENABLED = false; // true: enabled, false: disabled