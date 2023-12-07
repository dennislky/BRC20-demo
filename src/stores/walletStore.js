import { makeAutoObservable, runInAction } from "mobx";

import { BtcWallet } from "@okxweb3/coin-bitcoin";

import {
  generateWalletId,
  getRequestPathWithSearchParams,
  getRequestUrl,
  headerParams,
  sleep,
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
  IS_MOCKING_BRC20_API,
  IS_SEND_TRANSACTION_BATCH_ENABLED,
  METHOD_GET,
  METHOD_POST,
  STEPS_INTERVAL,
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

  tickName = "";
  inscribeAddress = "";
  transferAddress = "";
  deployAmount = 100;
  deployLimit = 5;
  mintAmount = 5;
  transferAmount = 1;

  deployOperations = {};
  mintOperations = {};
  transferOperations = {};
  transferOrderId = undefined;

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
      if (json && json.code === 0) {
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
      if (json && json.code === 0) {
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
      if (json && json.code === 0) {
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
      if (json && json.code === 0) {
        const data = json.data;
        return data;
      } else {
        // if (IS_MOCKING_BRC20_API) {
        //   return [
        //     {
        //       tokenAssets: [
        //         {
        //           address:
        //             "bc1psnr548clz3f4fz6jmpnw5eqzj2v2musk082wp8fvq5ac3p5ete6qg05u8u",
        //           chainId: "0",
        //           coinId: "1",
        //           symbol: "BTC",
        //           balance: "0.00311441",
        //           coinPrice: "41645.8",
        //         },
        //       ],
        //       brc20TokenAssets: [
        //         {
        //           address:
        //             "bc1psnr548clz3f4fz6jmpnw5eqzj2v2musk082wp8fvq5ac3p5ete6qg05u8u",
        //           chainId: "0",
        //           coinId: "1115139",
        //           symbol: "tokb",
        //           totalBalance: "10.00000000000000000",
        //           availableBalance: "3.00000000000000000",
        //           transferableBalance: "7.00000000000000000",
        //           coinPrice: "0",
        //         },
        //       ],
        //     },
        //   ];
        // }
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
      if (json && json.code === 0) {
        const data = json.data;
        return data;
      } else {
        // if (IS_MOCKING_BRC20_API) {
        //   return [
        //     {
        //       chainId: "0",
        //       orderId: "486750864669831168",
        //       txHash:
        //         "196b1c9a4a1151af320b874790fda1f83eda43182d3633f20e0b296f8bc7d5d8",
        //       fromAddr:
        //         "bc1psnr548clz3f4fz6jmpnw5eqzj2v2musk082wp8fvq5ac3p5ete6qg05u8u",
        //       toAddr:
        //         "bc1p9nkcnw8ae9az43uamnaws2e9nvlzm8yjxh48mr3ywvcy7tns6ywqdq77l4",
        //       txType: "53",
        //       txTime: "1701695331000",
        //       txStatus: "4",
        //       rowId: "1701695329436264453",
        //       assetSummary: [
        //         {
        //           coinId: "1115139",
        //           brc20Coin: true,
        //           coinAmount: "1.00000000000000000",
        //           coinAmountNum: "1000000000000000000",
        //           precision: "18",
        //           coinSymbol: "tokb",
        //           coinName: "tokb",
        //           coinLogoUrl:
        //             "https://static.coinall.ltd/cdn/wallet/logo/icon_custom_default_t.png",
        //           direction: 2,
        //         },
        //       ],
        //     },
        //     {
        //       chainId: "0",
        //       orderId: "486740719281782784",
        //       txHash:
        //         "a1a41ccfe62ba715a085059ee455f164f649b5321ebb361ef6a4d65b24b047a0",
        //       fromAddr:
        //         "bc1p5vs6u2ff3a6n3qa83xmsxdflqpyg6492nvja4dvpehdf96896e2shx5a0w",
        //       toAddr:
        //         "bc1psnr548clz3f4fz6jmpnw5eqzj2v2musk082wp8fvq5ac3p5ete6qg05u8u",
        //       txType: "51",
        //       txTime: "1701693009000",
        //       txStatus: "4",
        //       rowId: "1701693007778930717",
        //       assetSummary: [
        //         {
        //           coinId: "1115139",
        //           brc20Coin: true,
        //           coinAmount: "0.0",
        //           coinAmountNum: "0",
        //           precision: "18",
        //           coinSymbol: "tokb",
        //           coinName: "tokb",
        //           coinLogoUrl:
        //             "https://static.coinall.ltd/cdn/wallet/logo/icon_custom_default_t.png",
        //           direction: 1,
        //         },
        //       ],
        //     },
        //     {
        //       chainId: "0",
        //       orderId: "485627229238341632",
        //       txHash:
        //         "64c89978eb7c1b9a197e2d86b49c2d025dc09f70b17bbb76894767e463a7cbec",
        //       fromAddr:
        //         "bc1p9ewvwpfzuleyq0q8tre3c79hdd9l2v32tg4d9ufvl5dffcjc758qplhdzs",
        //       toAddr:
        //         "bc1psnr548clz3f4fz6jmpnw5eqzj2v2musk082wp8fvq5ac3p5ete6qg05u8u",
        //       txType: "60",
        //       txTime: "1701427041000",
        //       txStatus: "4",
        //       rowId: "1701427038981498384",
        //       assetSummary: [],
        //     },
        //   ];
        // }
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
      const searchParams = {
        walletId,
        orderId,
        chainId,
      };
      const url = getRequestUrl(API_GET_TRANSACTION_DETAIL, searchParams);
      const response = await fetch(url, {
        method: METHOD_GET,
        headers: this.getHeaderParams(
          date,
          METHOD_GET,
          getRequestPathWithSearchParams(
            API_GET_TRANSACTION_DETAIL,
            searchParams
          )
        ),
      });
      const json = await response.json();
      if (json && json.code === 0) {
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

  setTickName = (tickName) => {
    this.tickName = tickName;
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
      if (json && json.code === 0) {
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
      if (json && json.code === 0) {
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
      if (json && json.code === 0) {
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
          amount: utxo.coinAmount,
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
        if (json && json.code === 0) {
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
      if (json && json.code === 0) {
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
      this.deployOperations.signInfo = {
        address: this.rootStore.appStore.fromAddress || this.inscribeAddress,
        message: "Fetching data from /get-sign-info API",
      };
      await sleep(STEPS_INTERVAL);
      const fromAddress =
        this.rootStore.appStore.fromAddress || this.inscribeAddress;
      const signInfo = await this.getSignInfo(fromAddress, fromAddress);
      runInAction(() => {
        this.deployOperations.signInfo = {
          ...this.deployOperations.signInfo,
          ...signInfo[0],
        };
      });
      await sleep(STEPS_INTERVAL);

      // txAmount for deploy BRC20 is 1 commit tx + 1 reveal tx
      this.deployOperations.utxo = {
        address: fromAddress,
        inscriptionOutput: signInfo[0].inscriptionOutput,
        minOutput: signInfo[0].minOutput,
        cost: FEE_RATE_MODE ? signInfo[0].normalCost : signInfo[0].maxCost,
        txAmount: 1 + 1,
        message: "Fetching data from /get-utxo API",
      };
      await sleep(STEPS_INTERVAL);
      let utxo;
      try {
        utxo = await this.getUTXO(
          fromAddress,
          signInfo[0].inscriptionOutput,
          signInfo[0].minOutput,
          FEE_RATE_MODE ? signInfo[0].normalCost : signInfo[0].maxCost,
          1 + 1
        );
      } catch (err) {
        console.error(err);
        runInAction(() => {
          this.deployOperations.utxo.errorMessage =
            "Fetching data from /get-utxo API fails, using mock data";
        });
        await sleep(STEPS_INTERVAL);
        utxo = [
          {
            address:
              "bc1psnr548clz3f4fz6jmpnw5eqzj2v2musk082wp8fvq5ac3p5ete6qg05u8u",
            canTransferAmount: "139255",
            utxoType: 11,
            utxoList: [
              {
                txHash:
                  "5c710aeac5567439926b80b6e6e4ccc503abb3db6478cb4bb004d53cfc2cd5e0",
                vout: 1,
                coinAmount: 63464,
                status: 1,
              },
            ],
          },
        ];
      }
      runInAction(() => {
        this.deployOperations.utxo = {
          ...this.deployOperations.utxo,
          ...utxo[0],
        };
      });
      await sleep(STEPS_INTERVAL);

      this.deployOperations.op = {
        tick: this.tickName,
        max: this.deployAmount.toString(),
        lim: this.deployLimit.toString(),
        message: "Constructing BRC20 deploy operation",
      };
      await sleep(STEPS_INTERVAL);
      const op = Object.assign(BRC20_DEPLOY_PARAMS, {
        tick: this.tickName,
        max: this.deployAmount.toString(),
        lim: this.deployLimit.toString(),
      });
      runInAction(() => {
        this.deployOperations.op = {
          ...this.deployOperations.op,
          ...op,
        };
      });
      await sleep(STEPS_INTERVAL);

      this.deployOperations.inscribedTxs = {
        address: fromAddress,
        utxoList: utxo[0].utxoList,
        feeRate: FEE_RATE_MODE
          ? signInfo[0].normalFeeRate
          : signInfo[0].maxFeeRate,
        inscriptionOutput: signInfo[0].inscriptionOutput,
        inscriptionBody: JSON.stringify(op),
        message: "Constructing BRC20 transaction",
      };
      await sleep(STEPS_INTERVAL);
      const inscribedTxs = await this.constructBRC20Tx(
        fromAddress,
        utxo[0].utxoList,
        FEE_RATE_MODE ? signInfo[0].normalFeeRate : signInfo[0].maxFeeRate,
        signInfo[0].inscriptionOutput,
        JSON.stringify(op)
      );
      runInAction(() => {
        this.deployOperations.inscribedTxs = {
          ...this.deployOperations.inscribedTxs,
          ...inscribedTxs,
        };
      });
      await sleep(STEPS_INTERVAL);

      this.deployOperations.txHashList = {
        fromAddress,
        toAddress: inscribedTxs.commitAddrs[0],
        txs: inscribedTxs,
        txType: BRC20_TYPE_DEPLOY,
        feeRate: FEE_RATE_MODE
          ? signInfo[0].normalFeeRate
          : signInfo[0].maxFeeRate,
        message: "Broadcasting BRC20 transactions in batch",
      };
      await sleep(STEPS_INTERVAL);
      const result = await this.sendTransactionBatch(
        fromAddress,
        inscribedTxs.commitAddrs[0],
        inscribedTxs,
        BRC20_TYPE_DEPLOY,
        FEE_RATE_MODE ? signInfo[0].normalFeeRate : signInfo[0].maxFeeRate
      );
      console.log("deployBRC20 result", result);
      if (result && result[0].txHashList) {
        runInAction(() => {
          this.deployOperations.txHashList = {
            ...this.deployOperations.txHashList,
            result: result[0].txHashList,
          };
        });
      } else {
        if (IS_MOCKING_BRC20_API) {
          this.deployOperations.txHashList = {
            ...this.deployOperations.txHashList,
            errorMessage: "Returning mock response for /send-transaction-batch",
            result: [
              {
                itemId: "commitTx",
                txHash:
                  "cd09509cc602ea797c5d3218f36b401a6f21202470ea6e2ef98db71d48980e1f",
              },
              {
                itemId: "reveal0",
                txHash:
                  "64c89978eb7c1b9a197e2d86b49c2d025dc09f70b17bbb76894767e463a7cbec",
              },
            ],
          };
        } else {
          throw new Error("deployBRC20 failed");
        }
      }
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  mintBRC20 = async () => {
    try {
      this.mintOperations.signInfo = {
        address: this.rootStore.appStore.fromAddress || this.inscribeAddress,
        message: "Fetching data from /get-sign-info API",
      };
      await sleep(STEPS_INTERVAL);
      const fromAddress =
        this.rootStore.appStore.fromAddress || this.inscribeAddress;
      const signInfo = await this.getSignInfo(fromAddress, fromAddress);
      runInAction(() => {
        this.mintOperations.signInfo = {
          ...this.mintOperations.signInfo,
          ...signInfo[0],
        };
      });
      await sleep(STEPS_INTERVAL);

      // txAmount for mint BRC20 is 1 commit tx + n reveal txs, in this case, n = 1
      this.mintOperations.utxo = {
        address: fromAddress,
        inscriptionOutput: signInfo[0].inscriptionOutput,
        minOutput: signInfo[0].minOutput,
        cost: FEE_RATE_MODE ? signInfo[0].normalCost : signInfo[0].maxCost,
        txAmount: 1 + 1,
        message: "Fetching data from /get-utxo API",
      };
      await sleep(STEPS_INTERVAL);
      let utxo;
      try {
        utxo = await this.getUTXO(
          fromAddress,
          signInfo[0].inscriptionOutput,
          signInfo[0].minOutput,
          FEE_RATE_MODE ? signInfo[0].normalCost : signInfo[0].maxCost,
          1 + 1
        );
      } catch (err) {
        console.error(err);
        runInAction(() => {
          this.mintOperations.utxo.errorMessage =
            "Fetching data from /get-utxo API fails, using mock data";
        });
        await sleep(STEPS_INTERVAL);
        utxo = [
          {
            address:
              "bc1psnr548clz3f4fz6jmpnw5eqzj2v2musk082wp8fvq5ac3p5ete6qg05u8u",
            canTransferAmount: "139255",
            utxoType: 11,
            utxoList: [
              {
                txHash:
                  "5c710aeac5567439926b80b6e6e4ccc503abb3db6478cb4bb004d53cfc2cd5e0",
                vout: 1,
                coinAmount: 63464,
                status: 1,
              },
            ],
          },
        ];
      }
      runInAction(() => {
        this.mintOperations.utxo = {
          ...this.mintOperations.utxo,
          ...utxo[0],
        };
      });
      await sleep(STEPS_INTERVAL);

      this.mintOperations.op = {
        tick: this.tickName,
        amt: this.mintAmount.toString(),
        message: "Constructing BRC20 mint operation",
      };
      await sleep(STEPS_INTERVAL);
      const op = Object.assign(BRC20_MINT_PARAMS, {
        tick: this.tickName,
        amt: this.mintAmount.toString(),
      });
      runInAction(() => {
        this.mintOperations.op = {
          ...this.mintOperations.op,
          ...op,
        };
      });
      await sleep(STEPS_INTERVAL);

      this.mintOperations.inscribedTxs = {
        address: fromAddress,
        utxoList: utxo[0].utxoList,
        feeRate: FEE_RATE_MODE
          ? signInfo[0].normalFeeRate
          : signInfo[0].maxFeeRate,
        inscriptionOutput: signInfo[0].inscriptionOutput,
        inscriptionBody: JSON.stringify(op),
        message: "Constructing BRC20 transaction",
      };
      await sleep(STEPS_INTERVAL);
      const inscribedTxs = await this.constructBRC20Tx(
        fromAddress,
        utxo[0].utxoList,
        FEE_RATE_MODE ? signInfo[0].normalFeeRate : signInfo[0].maxFeeRate,
        signInfo[0].inscriptionOutput,
        JSON.stringify(op)
      );
      runInAction(() => {
        this.mintOperations.inscribedTxs = {
          ...this.mintOperations.inscribedTxs,
          ...inscribedTxs,
        };
      });
      await sleep(STEPS_INTERVAL);

      this.mintOperations.txHashList = {
        fromAddress,
        toAddress: inscribedTxs.commitAddrs[0],
        txs: inscribedTxs,
        txType: BRC20_TYPE_MINT,
        feeRate: FEE_RATE_MODE
          ? signInfo[0].normalFeeRate
          : signInfo[0].maxFeeRate,
        message: "Broadcasting BRC20 transactions in batch",
      };
      await sleep(STEPS_INTERVAL);
      const result = await this.sendTransactionBatch(
        fromAddress,
        inscribedTxs.commitAddrs[0],
        inscribedTxs,
        BRC20_TYPE_MINT,
        FEE_RATE_MODE ? signInfo[0].normalFeeRate : signInfo[0].maxFeeRate
      );
      console.log("mintBRC20 result", result);
      if (result && result[0].txHashList) {
        runInAction(() => {
          this.mintOperations.txHashList = {
            ...this.mintOperations.txHashList,
            result: result[0].txHashList,
          };
        });
      } else {
        if (IS_MOCKING_BRC20_API) {
          this.mintOperations.txHashList = {
            ...this.mintOperations.txHashList,
            errorMessage: "Returning mock response for /send-transaction-batch",
            result: [
              {
                itemId: "commitTx",
                txHash:
                  "e48ddae2a1bbe48eff1c06dc68deddf1685fdef9e0c568ca1af22a80f6a92971",
              },
              {
                itemId: "reveal0",
                txHash:
                  "945c94dc5f596a198238954e6d898fef359c3f64b199698d0899b6b08ee6cf08",
              },
              {
                itemId: "reveal1",
                txHash:
                  "350c1be760c92c5d11823a1f04153e0534b20d458284f6544965a2dba2b6c27c",
              },
            ],
          };
        } else {
          throw new Error("mintBRC20 failed");
        }
      }
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  transferBRC20 = async () => {
    try {
      this.transferOperations.signInfo = {
        address: this.rootStore.appStore.fromAddress || this.inscribeAddress,
        message: "Fetching data from /get-sign-info API",
      };
      await sleep(STEPS_INTERVAL);
      const fromAddress =
        this.rootStore.appStore.fromAddress || this.inscribeAddress;
      const signInfo = await this.getSignInfo(fromAddress, fromAddress);
      runInAction(() => {
        this.transferOperations.signInfo = {
          ...this.transferOperations.signInfo,
          ...signInfo[0],
        };
      });
      await sleep(STEPS_INTERVAL);

      // txAmount for transfer BRC20 is 1 commit tx + n reveal txs, in this case, n = 1
      this.transferOperations.utxo = {
        address: fromAddress,
        inscriptionOutput: signInfo[0].inscriptionOutput,
        minOutput: signInfo[0].minOutput,
        cost: FEE_RATE_MODE ? signInfo[0].normalCost : signInfo[0].maxCost,
        txAmount: 1 + 1,
        message: "Fetching data from /get-utxo API",
      };
      await sleep(STEPS_INTERVAL);
      let utxo;
      try {
        utxo = await this.getUTXO(
          fromAddress,
          signInfo[0].inscriptionOutput,
          signInfo[0].minOutput,
          FEE_RATE_MODE ? signInfo[0].normalCost : signInfo[0].maxCost,
          1 + 1
        );
      } catch (err) {
        console.error(err);
        runInAction(() => {
          this.transferOperations.utxo.errorMessage =
            "Fetching data from /get-utxo API fails, using mock data";
        });
        await sleep(STEPS_INTERVAL);
        utxo = [
          {
            address:
              "bc1psnr548clz3f4fz6jmpnw5eqzj2v2musk082wp8fvq5ac3p5ete6qg05u8u",
            canTransferAmount: "139255",
            utxoType: 11,
            utxoList: [
              {
                txHash:
                  "5c710aeac5567439926b80b6e6e4ccc503abb3db6478cb4bb004d53cfc2cd5e0",
                vout: 1,
                coinAmount: 63464,
                status: 1,
              },
            ],
          },
        ];
      }
      runInAction(() => {
        this.transferOperations.utxo = {
          ...this.transferOperations.utxo,
          ...utxo[0],
        };
      });
      await sleep(STEPS_INTERVAL);

      this.transferOperations.op = {
        tick: this.tickName,
        amt: this.transferAmount.toString(),
        message: "Constructing BRC20 transfer operation",
      };
      await sleep(STEPS_INTERVAL);
      const op = Object.assign(BRC20_TRANSFER_PARAMS, {
        tick: this.tickName,
        amt: this.transferAmount.toString(),
      });
      runInAction(() => {
        this.transferOperations.op = {
          ...this.transferOperations.op,
          ...op,
        };
      });
      await sleep(STEPS_INTERVAL);

      this.transferOperations.inscribedTxs = {
        address: fromAddress,
        utxoList: utxo[0].utxoList,
        feeRate: FEE_RATE_MODE
          ? signInfo[0].normalFeeRate
          : signInfo[0].maxFeeRate,
        inscriptionOutput: signInfo[0].inscriptionOutput,
        inscriptionBody: JSON.stringify(op),
        message: "Constructing BRC20 transaction",
      };
      await sleep(STEPS_INTERVAL);
      const inscribedTxs = await this.constructBRC20Tx(
        fromAddress,
        utxo[0].utxoList,
        FEE_RATE_MODE ? signInfo[0].normalFeeRate : signInfo[0].maxFeeRate,
        signInfo[0].inscriptionOutput,
        JSON.stringify(op)
      );
      runInAction(() => {
        this.transferOperations.inscribedTxs = {
          ...this.transferOperations.inscribedTxs,
          ...inscribedTxs,
        };
      });
      await sleep(STEPS_INTERVAL);

      this.transferOperations.txHashList = {
        fromAddress,
        toAddress: inscribedTxs.commitAddrs[0],
        txs: inscribedTxs,
        txType: BRC20_TYPE_TRANSFER,
        feeRate: FEE_RATE_MODE
          ? signInfo[0].normalFeeRate
          : signInfo[0].maxFeeRate,
        message: "Broadcasting BRC20 transactions in batch",
      };
      await sleep(STEPS_INTERVAL);
      const result = await this.sendTransactionBatch(
        fromAddress,
        inscribedTxs.commitAddrs[0],
        inscribedTxs,
        BRC20_TYPE_TRANSFER,
        FEE_RATE_MODE ? signInfo[0].normalFeeRate : signInfo[0].maxFeeRate
      );
      console.log("transferBRC20 result", result);
      if (result && result[0].txHashList) {
        runInAction(() => {
          this.transferOperations.txHashList = {
            ...this.transferOperations.txHashList,
            result: result[0].txHashList,
          };
        });
      } else {
        if (IS_MOCKING_BRC20_API) {
          this.transferOperations.txHashList = {
            ...this.transferOperations.txHashList,
            errorMessage: "Returning mock response for /send-transaction-batch",
            result: [
              {
                itemId: "commitTx",
                txHash:
                  "e48ddae2a1bbe48eff1c06dc68deddf1685fdef9e0c568ca1af22a80f6a92971",
              },
              {
                itemId: "reveal0",
                txHash:
                  "945c94dc5f596a198238954e6d898fef359c3f64b199698d0899b6b08ee6cf08",
              },
              {
                itemId: "reveal1",
                txHash:
                  "350c1be760c92c5d11823a1f04153e0534b20d458284f6544965a2dba2b6c27c",
              },
            ],
          };
        } else {
          throw new Error("transferBRC20 failed");
        }
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
      if (transferResult && transferResult.length) {
        runInAction(() => {
          this.transferOrderId = transferResult[0].orderId;
        });
      } else {
        throw new Error("transferBRC20 transfer failed");
      }
      return transferResult;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  dispose() {
    this.coinTypeMapping = [];
    this.isInit = false;

    this.chainsAvailable = [
      {
        name: "BTC",
        imageUrl: "https://static.coinall.ltd/cdn/wallet/logo/BTC.png",
        shortName: "btc",
        coinId: 1,
        chainId: 0,
      },
    ];
    this.coinsAvailable = [];
    this.selectedChain = undefined;
    this.selectedCoin = undefined;

    this.walletInfos = [];
    this.walletId = undefined;

    this.tickName = "";
    this.inscribeAddress = "";
    this.transferAddress = "";
    this.deployAmount = 100;
    this.deployLimit = 5;
    this.mintAmount = 5;
    this.transferAmount = 1;

    this.deployOperations = {};
    this.mintOperations = {};
    this.transferOperations = {};
    this.transferOrderId = undefined;
  }
}
