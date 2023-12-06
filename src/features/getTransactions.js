import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Alert,
  AlertTitle,
  Divider,
  Link,
} from "@mui/material";

import { CardActionButton } from "../components/CardActionButton";
import { useStore } from "../stores";
import { OKLINK_TRANSACTION_PREFIX } from "../constants";

// card per feature
const GetTransactionsCard = () => {
  // local UI state
  const [errorMessage, setErrorMessage] = useState("");
  const [transactions, setTransactions] = useState();

  // mobx store that link up with sdk wallets
  const { walletStore, appStore } = useStore();
  const { isInit, chainsAvailable, walletId } = walletStore;
  const { walletId: appStoreWalletId } = appStore;

  // local UI state cleanup when sdk re-initialized
  useEffect(() => {
    setErrorMessage("");
    setTransactions();
  }, [isInit]);

  // feature logic
  const getTransactions = async () => {
    try {
      setErrorMessage("");
      const data = await walletStore.getTransactions();
      console.log("getTransactions data", data);
      setTransactions(data);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.toString());
    }
  };

  // render logic
  return isInit ? (
    <>
      <Card
        variant="outlined"
        sx={{ minWidth: 275, borderRadius: 5 }}
        key="get-transactions-card"
      >
        <CardContent sx={{ pb: 1 }}>
          <Typography sx={{ fontSize: 26 }}>Get Transactions</Typography>
        </CardContent>
        <Divider flexItem />
        <CardActions sx={{ pl: 2, pr: 2, pb: 2 }}>
          <CardActionButton
            buttonText="Get Transactions"
            onClick={getTransactions}
            disabled={
              !isInit ||
              chainsAvailable?.length === 0 ||
              (!walletId && !appStoreWalletId)
            }
            testId="get-transactions"
          />
        </CardActions>
        {errorMessage && (
          <Alert severity="error">
            <AlertTitle>Failure</AlertTitle>
            {errorMessage}
          </Alert>
        )}
        {transactions ? (
          <Alert severity="success">
            <AlertTitle>Transactions</AlertTitle>
            {transactions.map((txDetail, index) => {
              return (
                <div key={txDetail.txHash}>
                  <div>{`Transaction Order ID: ${txDetail.orderId}`}</div>
                  <Link
                    href={`${OKLINK_TRANSACTION_PREFIX}${txDetail.txHash}`}
                    target="_blank"
                    rel="noopener"
                  >{`Link: ${OKLINK_TRANSACTION_PREFIX}${txDetail.txHash}`}</Link>
                  <div>{`Chain ID: ${txDetail.chainId}`}</div>
                  <div>{`From Address: ${txDetail.fromAddr}`}</div>
                  <div>{`To Address: ${txDetail.toAddr}`}</div>
                  <div>{`Time: ${new Date(
                    parseInt(txDetail.txTime, 10)
                  ).toISOString()}`}</div>
                  {index < transactions.length - 1 ? <br /> : null}
                </div>
              );
            })}
          </Alert>
        ) : null}
      </Card>
    </>
  ) : null;
};

export default observer(GetTransactionsCard);
