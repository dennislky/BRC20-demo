import { makeAutoObservable, runInAction } from "mobx";

import { BtcWallet } from "@okxweb3/coin-bitcoin";

import {
  generateWalletId,
  getRequestPathWithSearchParams,
  getRequestUrl,
  headerParams,
} from "../utils/index";
import {
  API_CREATE_WALLET,
  API_GET_ALL_CHAINS,
  API_GET_ALL_COINS,
  API_GET_ASSETS,
  API_GET_SIGN_INFO,
  API_GET_TRANSACTIONS,
  API_GET_TRANSACTION_DETAIL,
  API_GET_UTXO,
  API_GET_UTXO_NFT,
  API_SEND_TRANSACTION,
  API_SEND_TRANSACTION_BATCH,
  BRC20_DEPLOY_PARAMS,
  BRC20_MINT_PARAMS,
  BRC20_TRANSFER_PARAMS,
  BRC20_TYPE_DEPLOY,
  BRC20_TYPE_MINT,
  BRC20_TYPE_TRANSFER,
  FEE_RATE_MODE,
  IS_SEND_TRANSACTION_BATCH_ENABLED,
  METHOD_GET,
  METHOD_POST,
  TICK_NAME,
} from "../constants/index";

export default class WalletStore {
  rootStore;

  coinTypeMapping = [];
  isInit = false;

  chainsAvailable = [
    {
      name: "BTC",
      imageUrl: "https://static.coinall.ltd/cdn/wallet/logo/BTC.png",
      shortName: "btc",
      coinId: 1,
      chainId: 0,
    },
  ];
  coinsAvailable = [];
  selectedChain = undefined;
  selectedCoin = undefined;

  walletInfos = [];
  walletId = "";

  inscribeAddress = "";
  transferAddress = "";
  deployAmount = 100;
  deployLimit = 5;
  mintAmount = 5;
  transferAmount = 1;

  deployTxHashList = [];
  mintTxHashList = [];
  transferTxHashList = [];

  constructor(rootStore) {
    makeAutoObservable(this, { rootStore: false });
    this.rootStore = rootStore;
  }

  initialize() {
    // BTC network wallets, need to reference what wallets @okxweb3/coin-bitcoin provide, methods provided per different wallets are different too
    this.btcWallet = new BtcWallet();
    this.coinTypeMapping.push({
      network: "BTC",
      token: "BTC",
      label: "BTC",
      wallet: this.btcWallet,
    });

    this.isInit = true;
  }

  getWallet(coinType) {
    const data = this.coinTypeMapping.find((data) => data.label === coinType);
    return data.wallet;
  }

  getHeaderParams = (date, method, path, body = undefined) => {
    return headerParams(
      date,
      method,
      path,
      body,
      this.rootStore.appStore.apiKey,
      this.rootStore.appStore.apiProjectId,
      this.rootStore.appStore.apiPassphrase,
      this.rootStore.appStore.apiSecretKey
    );
  };

  fetchChainsAvailable = async () => {
    try {
      const date = new Date().toISOString();
      const url = getRequestUrl(API_GET_ALL_CHAINS);
      const response = await fetch(url, {
        headers: this.getHeaderParams(date, METHOD_GET, API_GET_ALL_CHAINS),
      });
      const json = await response.json();
      if (json && json.data && json.data.length) {
        const data = json.data;
        runInAction(() => {
          this.chainsAvailable = data;
          console.log("chainsAvailable", this.chainsAvailable);
        });
      } else {
        throw new Error("fetchChainsAvailable failed");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  setSelectedChain = (chainId) => {
    this.selectedChain = this.chainsAvailable.find(
      (chain) => chain.chainId === chainId
    );
  };

  fetchCoinsAvailable = async () => {
    try {
      const date = new Date().toISOString();
      const url = getRequestUrl(API_GET_ALL_COINS, {
        type: 0,
      });
      const path = getRequestPathWithSearchParams(API_GET_ALL_COINS, {
        type: 0,
      });
      const response = await fetch(url, {
        headers: this.getHeaderParams(date, METHOD_GET, path),
      });
      const json = await response.json();
      if (json && json.data && json.data.length) {
        const data = json.data;
        runInAction(() => {
          this.coinsAvailable = data;
          console.log("coinsAvailable", this.coinsAvailable);
        });
      } else {
        throw new Error("fetchCoinsAvailable failed");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  setWalletInfos = (walletInfos) => {
    this.walletInfos = walletInfos;
  };

  createWallet = async () => {
    try {
      const walletId = generateWalletId();
      const date = new Date().toISOString();
      const url = getRequestUrl(API_CREATE_WALLET);
      const body = {
        walletId,
        addresses: this.walletInfos.map((walletInfo) => {
          return {
            chainId: walletInfo.chainId || 0,
            address: walletInfo.address,
          };
        }),
      };
      console.log("createWallet body", body);
      const response = await fetch(url, {
        method: METHOD_POST,
        headers: this.getHeaderParams(
          date,
          METHOD_POST,
          API_CREATE_WALLET,
          JSON.stringify(body)
        ),
        body: JSON.stringify(body),
      });
      const json = await response.json();
      if (json && json.data && json.data.length) {
        const data = json.data;
        runInAction(() => {
          this.walletId = data[0].walletId;
          this.inscribeAddress = this.walletInfos.find(
            (walletInfo) => walletInfo.coinType === "BTC"
          ).address;
          this.transferAddress = this.rootStore.appStore.toAddress || "";
        });
      } else {
        throw new Error("createWallet failed");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  getBalance = async () => {
    try {
      const walletId = this.rootStore.appStore.walletId || this.walletId;
      const date = new Date().toISOString();
      const url = getRequestUrl(API_GET_ASSETS);
      const body = {
        walletId,
        chainIds: this.walletInfos.reduce((arr, walletInfo) => {
          if (!arr.includes(walletInfo.chainId)) {
            return arr;
          }
          return [...arr, walletInfo.chainId];
        }, []),
      };
      const response = await fetch(url, {
        method: METHOD_POST,
        headers: this.getHeaderParams(
          date,
          METHOD_POST,
          API_GET_ASSETS,
          JSON.stringify(body)
        ),
        body: JSON.stringify(body),
      });
      const json = await response.json();
      if (json && json.data && json.data.length) {
        const data = json.data;
        return data;
      } else {
        if (json) {
          throw new Error(json.msg);
        }
        throw new Error("getBalance failed");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  getTransactions = async () => {
    try {
      const walletId = this.rootStore.appStore.walletId || this.walletId;
      const date = new Date().toISOString();
      const url = getRequestUrl(API_GET_TRANSACTIONS);
      const body = {
        walletId,
        limit: 10,
      };
      const response = await fetch(url, {
        method: METHOD_POST,
        headers: this.getHeaderParams(
          date,
          METHOD_POST,
          API_GET_TRANSACTIONS,
          JSON.stringify(body)
        ),
        body: JSON.stringify(body),
      });
      const json = await response.json();
      if (json && json.data && json.data.length) {
        const data = json.data;
        return data;
      } else {
        if (json) {
          throw new Error(json.msg);
        }
        throw new Error("getTransactions failed");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  getTransactionDetail = async (orderId, chainId) => {
    try {
      const walletId = this.rootStore.appStore.walletId || this.walletId;
      const date = new Date().toISOString();
      const url = getRequestUrl(API_GET_TRANSACTION_DETAIL);
      const body = {
        walletId,
        orderId,
        chainId,
      };
      const response = await fetch(url, {
        method: METHOD_POST,
        headers: this.getHeaderParams(
          date,
          METHOD_POST,
          API_GET_TRANSACTION_DETAIL,
          JSON.stringify(body)
        ),
        body: JSON.stringify(body),
      });
      const json = await response.json();
      if (json && json.data && json.data.length) {
        const data = json.data;
        return data;
      } else {
        if (json) {
          throw new Error(json.msg);
        }
        throw new Error("getTransactions failed");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  setInscribeAddress = (address) => {
    this.inscribeAddress = address;
  };

  setTransferAddress = (address) => {
    this.transferAddress = address;
  };

  setDeployAmount = (amount) => {
    this.deployAmount = amount;
  };

  setDeployLimit = (limit) => {
    this.deployLimit = limit;
  };

  setMintAmount = (amount) => {
    this.mintAmount = amount;
  };

  setTransferAmount = (amount) => {
    this.transferAmount = amount;
  };

  getSignInfo = async (fromAddress, toAddress) => {
    try {
      const date = new Date().toISOString();
      const url = getRequestUrl(API_GET_SIGN_INFO);
      const body = {
        addrFrom: fromAddress,
        addrTo: toAddress,
        txAmount: 0,
        chainId: 0,
        extJson: {},
      };
      const response = await fetch(url, {
        method: METHOD_POST,
        headers: this.getHeaderParams(
          date,
          METHOD_POST,
          API_GET_SIGN_INFO,
          JSON.stringify(body)
        ),
        body: JSON.stringify(body),
      });
      const json = await response.json();
      if (json && json.data && json.data.length) {
        const data = json.data;
        console.log("getSignInfo data", data);
        return data;
      } else {
        if (json) {
          throw new Error(json.msg);
        }
        throw new Error("getSignInfo failed");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  getUTXO = async (
    fromAddress,
    inscriptionOutput,
    minOutput,
    cost,
    txAmount,
    utxoType = 11
  ) => {
    try {
      const date = new Date().toISOString();
      const url = getRequestUrl(API_GET_UTXO);
      const body = {
        chainId: 0,
        utxoRequests: [
          {
            address: fromAddress,
            coinAmount:
              inscriptionOutput * txAmount > minOutput
                ? inscriptionOutput * txAmount
                : minOutput,
            serviceCharge: cost * txAmount,
            utxoType,
          },
        ],
      };
      const response = await fetch(url, {
        method: METHOD_POST,
        headers: this.getHeaderParams(
          date,
          METHOD_POST,
          API_GET_UTXO,
          JSON.stringify(body)
        ),
        body: JSON.stringify(body),
      });
      const json = await response.json();
      if (json && json.data && json.data.length) {
        const data = json.data;
        console.log("getUTXO data", data);
        return data;
      } else {
        if (json) {
          throw new Error(json.msg);
        }
        throw new Error("getUTXO failed");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  getUTXONFT = async (fromAddress) => {
    try {
      const date = new Date().toISOString();
      const url = getRequestUrl(API_GET_UTXO_NFT);
      const body = {
        chainId: 0,
        utxoRequests: [
          {
            address: fromAddress,
            tick: TICK_NAME,
            page: 1,
            pageSize: 10,
          },
        ],
      };
      const response = await fetch(url, {
        method: METHOD_POST,
        headers: this.getHeaderParams(
          date,
          METHOD_POST,
          API_GET_UTXO_NFT,
          JSON.stringify(body)
        ),
        body: JSON.stringify(body),
      });
      const json = await response.json();
      if (json && json.data && json.data.length) {
        const data = json.data;
        console.log("getUTXONFT data", data);
        return data;
      } else {
        if (json) {
          throw new Error(json.msg);
        }
        throw new Error("getUTXONFT failed");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  constructBRC20Tx = async (
    fromAddress,
    utxoList,
    feeRate,
    inscriptionOutput,
    inscriptionBody
  ) => {
    try {
      const privateKey =
        this.rootStore.appStore.privateKey ||
        this.walletInfos.find((walletInfo) => walletInfo.coinType === "BTC")
          .privateKey;

      const commitTxPrevOutputList = [];
      utxoList.forEach((utxo) => {
        commitTxPrevOutputList.push({
          txId: utxo.txHash,
          vOut: utxo.vout,
          amount: utxo.coinAmount - parseInt(inscriptionOutput, 10),
          address: fromAddress,
          privateKey,
        });
      });
      const inscriptionDataList = [];
      inscriptionDataList.push({
        contentType: "text/plain;charset=utf-8",
        body: inscriptionBody,
        revealAddr: fromAddress,
      });
      console.log("inscriptionDataList", inscriptionDataList);
      const wallet = this.getWallet("BTC");
      const data = {
        type: 1,
        commitTxPrevOutputList,
        commitFeeRate: feeRate,
        revealFeeRate: feeRate,
        revealOutValue: parseInt(inscriptionOutput, 10),
        inscriptionDataList,
        changeAddress: fromAddress,
      };
      console.log("constructBRC20Tx data", data);
      const txs = await wallet.signTransaction({ data });
      console.log("constructBRC20Tx txs", txs);
      return txs;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  constructBTCTx = async (
    fromAddress,
    toAddress,
    utxoNFTList,
    utxoList,
    feeRate,
    inscriptionOutput
  ) => {
    try {
      const privateKey =
        this.rootStore.appStore.privateKey ||
        this.walletInfos.find((walletInfo) => walletInfo.coinType === "BTC")
          .privateKey;

      let inputs = utxoNFTList.map((utxo) => {
        return {
          txId: utxo.txHash,
          vOut: utxo.vout,
          amount: utxo.coinAmount,
        };
      });
      inputs = inputs.concat(
        utxoList.map((utxo) => {
          return {
            txId: utxo.txHash,
            vOut: utxo.vout,
            amount: utxo.coinAmount,
          };
        })
      );
      const outputs = [
        {
          address: toAddress,
          amount: parseInt(inscriptionOutput, 0),
        },
      ];
      const data = {
        type: 0,
        inputs,
        outputs,
        address: fromAddress,
        feePerB: feeRate,
      };
      console.log("signTransaction data", data);

      const wallet = this.getWallet("BTC");
      const txs = await wallet.signTransaction({
        privateKey,
        data,
      });
      return txs;
    } catch (err) {
      console.error(err);
    }
  };

  sendTransactionBatch = async (
    fromAddress,
    toAddress,
    txs,
    txType,
    feeRate
  ) => {
    try {
      const walletId = this.rootStore.appStore.walletId || this.walletId;
      const date = new Date().toISOString();
      const url = getRequestUrl(API_SEND_TRANSACTION_BATCH);

      const wallet = this.getWallet("BTC");
      const body = {
        txList: [
          {
            signedTx: txs.commitTx,
            walletId,
            addrFrom: fromAddress,
            addrTo: toAddress,
            txHash: await wallet.calcTxHash({
              data: txs.commitTx,
            }),
            txAmount: 0,
            chainId: 0,
            txType,
            serviceCharge: txs.commitTxFee,
            tokenAddress:
              txType === BRC20_TYPE_DEPLOY ? "" : `btc-brc20-${TICK_NAME}`,
            extJson: {
              broadcastType: 1,
              dependTx: [],
              feeRate,
              itemId: "commitTx",
            },
          },
          ...(await Promise.all(
            txs.revealTxs.map(async (revealTx, index) => {
              return {
                signedTx: revealTx,
                walletId,
                addrFrom: toAddress,
                addrTo: fromAddress,
                txHash: await wallet.calcTxHash({
                  data: revealTx,
                }),
                txAmount: 0,
                chainId: 0,
                txType,
                serviceCharge: txs.revealTxFees[index],
                tokenAddress:
                  txType === BRC20_TYPE_DEPLOY ? "" : `btc-brc20-${TICK_NAME}`,
                extJson: {
                  broadcastType: 1,
                  dependTx: [
                    await wallet.calcTxHash({
                      data: txs.commitTx,
                    }),
                  ],
                  feeRate,
                  itemId: `revealTx${index}`,
                },
              };
            })
          )),
        ],
      };
      console.log("sendTransactionBatch body", body);
      if (IS_SEND_TRANSACTION_BATCH_ENABLED) {
        const response = await fetch(url, {
          method: METHOD_POST,
          headers: this.getHeaderParams(
            date,
            METHOD_POST,
            API_SEND_TRANSACTION_BATCH,
            JSON.stringify(body)
          ),
          body: JSON.stringify(body),
        });
        const json = await response.json();
        if (json && json.data && json.data.length) {
          const data = json.data;
          return data;
        } else {
          throw new Error("sendTransactionBatch failed");
        }
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  sendTransaction = async (
    fromAddress,
    toAddress,
    tx,
    txType,
    feeRate,
    utxoNFTList
  ) => {
    try {
      const walletId = this.rootStore.appStore.walletId || this.walletId;
      const date = new Date().toISOString();
      const url = getRequestUrl(API_SEND_TRANSACTION);

      const wallet = this.getWallet("BTC");
      const body = {
        signedTx: tx,
        walletId,
        addrFrom: fromAddress,
        addrTo: toAddress,
        txHash: await wallet.calcTxHash({
          data: tx,
        }),
        txAmount: utxoNFTList[0].tokenAmount,
        chainId: 0,
        txType,
        serviceCharge: 0,
        tokenAddress: `btc-brc20-${TICK_NAME}`,
        extJson: {
          feeRate,
        },
      };
      console.log("sendTransaction", JSON.stringify(body));
      const response = await fetch(url, {
        method: METHOD_POST,
        headers: this.getHeaderParams(
          date,
          METHOD_POST,
          API_SEND_TRANSACTION,
          JSON.stringify(body)
        ),
        body: JSON.stringify(body),
      });
      const json = await response.json();
      if (json && json.data && json.data.length) {
        const data = json.data;
        return data;
      } else {
        if (json) {
          throw new Error(json.msg);
        }
        throw new Error("sendTransaction failed");
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  deployBRC20 = async () => {
    try {
      const fromAddress =
        this.rootStore.appStore.fromAddress || this.inscribeAddress;
      const signInfo = await this.getSignInfo(fromAddress, fromAddress);
      // txAmount for deploy BRC20 is 1 commit tx + 1 reveal tx
      const utxo = await this.getUTXO(
        fromAddress,
        signInfo[0].inscriptionOutput,
        signInfo[0].minOutput,
        FEE_RATE_MODE ? signInfo[0].normalCost : signInfo[0].maxCost,
        1 + 1
      );
      const op = Object.assign(BRC20_DEPLOY_PARAMS, {
        max: this.deployAmount.toString(),
        lim: this.deployLimit.toString(),
      });
      console.log("deployBRC20 op", op);
      const inscribedTxs = await this.constructBRC20Tx(
        fromAddress,
        utxo[0].utxoList,
        FEE_RATE_MODE ? signInfo[0].normalFeeRate : signInfo[0].maxFeeRate,
        signInfo[0].inscriptionOutput,
        JSON.stringify(op)
      );
      console.log("commitAddr", inscribedTxs.commitAddrs);
      const result = await this.sendTransactionBatch(
        fromAddress,
        inscribedTxs.commitAddrs[0],
        inscribedTxs,
        BRC20_TYPE_DEPLOY,
        FEE_RATE_MODE ? signInfo[0].normalFeeRate : signInfo[0].maxFeeRate
      );
      console.log("deployBRC20 result", result);
      if (result && result[0].txHashList) {
        this.deployTxHashList.push({ txHashList: result[0].txHashList, op });
      } else {
        throw new Error("deployBRC20 failed");
      }
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  mintBRC20 = async () => {
    try {
      const fromAddress =
        this.rootStore.appStore.fromAddress || this.inscribeAddress;
      const signInfo = await this.getSignInfo(fromAddress, fromAddress);
      const utxo = await this.getUTXO(
        fromAddress,
        signInfo[0].inscriptionOutput,
        signInfo[0].minOutput,
        FEE_RATE_MODE ? signInfo[0].normalCost : signInfo[0].maxCost,
        1 + 1
      );
      const op = Object.assign(BRC20_MINT_PARAMS, {
        amt: this.mintAmount.toString(),
      });
      console.log("mintBRC20 op", op);
      const inscribedTxs = await this.constructBRC20Tx(
        fromAddress,
        utxo[0].utxoList,
        FEE_RATE_MODE ? signInfo[0].normalFeeRate : signInfo[0].maxFeeRate,
        signInfo[0].inscriptionOutput,
        JSON.stringify(op)
      );
      const result = await this.sendTransactionBatch(
        fromAddress,
        inscribedTxs.commitAddrs[0],
        inscribedTxs,
        BRC20_TYPE_MINT,
        FEE_RATE_MODE ? signInfo[0].normalFeeRate : signInfo[0].maxFeeRate
      );
      console.log("mintBRC20 result", result);
      if (result && result[0].txHashList) {
        this.mintTxHashList.push({ txHashList: result[0].txHashList, op });
      } else {
        throw new Error("mintBRC20 failed");
      }
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  transferBRC20 = async () => {
    try {
      const fromAddress =
        this.rootStore.appStore.fromAddress || this.inscribeAddress;
      const signInfo = await this.getSignInfo(fromAddress, fromAddress);
      let utxo = await this.getUTXO(
        fromAddress,
        signInfo[0].inscriptionOutput,
        signInfo[0].minOutput,
        FEE_RATE_MODE ? signInfo[0].normalCost : signInfo[0].maxCost,
        1 + 1
      );
      const op = Object.assign(BRC20_TRANSFER_PARAMS, {
        amt: this.transferAmount.toString(),
      });
      console.log("transferBRC20 op", op);
      const inscribedTxs = await this.constructBRC20Tx(
        fromAddress,
        utxo[0].utxoList,
        FEE_RATE_MODE ? signInfo[0].normalFeeRate : signInfo[0].maxFeeRate,
        signInfo[0].inscriptionOutput,
        JSON.stringify(op)
      );
      const result = await this.sendTransactionBatch(
        fromAddress,
        inscribedTxs.commitAddrs[0],
        inscribedTxs,
        BRC20_TYPE_TRANSFER,
        FEE_RATE_MODE ? signInfo[0].normalFeeRate : signInfo[0].maxFeeRate
      );
      console.log("transferBRC20 inscribe result", result);
      if (result && result[0].txHashList) {
        this.transferTxHashList.push({ txHashList: result[0].txHashList, op });
      } else {
        throw new Error("transferBRC20 failed");
      }
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  transferBRC20NFT = async () => {
    try {
      const fromAddress =
        this.rootStore.appStore.fromAddress || this.inscribeAddress;
      const toAddress =
        this.rootStore.appStore.toAddress || this.transferAddress;
      const transferSignInfo = await this.getSignInfo(fromAddress, toAddress);
      const utxoNFT = await this.getUTXONFT(fromAddress);
      const utxo = await this.getUTXO(
        fromAddress,
        transferSignInfo[0].inscriptionOutput,
        transferSignInfo[0].minOutput,
        FEE_RATE_MODE
          ? transferSignInfo[0].normalCost
          : transferSignInfo[0].maxCost,
        1 + 1,
        1
      );
      const tx = await this.constructBTCTx(
        fromAddress,
        toAddress,
        utxoNFT[0].utxoList,
        utxo[0].utxoList,
        FEE_RATE_MODE
          ? transferSignInfo[0].normalFeeRate
          : transferSignInfo[0].maxFeeRate,
        transferSignInfo[0].inscriptionOutput
      );
      const transferResult = await this.sendTransaction(
        fromAddress,
        toAddress,
        tx,
        "TRANSFER",
        FEE_RATE_MODE
          ? transferSignInfo[0].normalFeeRate
          : transferSignInfo[0].maxFeeRate,
        FEE_RATE_MODE
          ? transferSignInfo[0].normalCost
          : transferSignInfo[0].maxCost,
        utxoNFT[0].utxoList
      );
      console.log("transferBRC20 transfer result", transferResult);
      return transferResult;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  dispose() {
    this.coinTypeMapping = [];
    this.isInit = false;

    this.chainsAvailable = [];
    this.coinsAvailable = [];
    this.selectedChain = undefined;
    this.selectedCoin = undefined;

    this.walletInfos = [];
    this.walletId = undefined;

    this.inscribeAddress = "";
    this.transferAddress = "";
    this.deployAmount = 100;
    this.deployLimit = 5;
    this.mintAmount = 5;
    this.transferAmount = 1;

    this.deployTxHashList = [];
    this.mintTxHashList = [];
    this.transferTxHashList = [];
  }
}
