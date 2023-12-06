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
  TextField,
  Link,
} from "@mui/material";

import { CardActionButton } from "../components/CardActionButton";
import { useStore } from "../stores";
import { OKLINK_TRANSACTION_PREFIX } from "../constants";

// card per feature
const GetTransactionDetailCard = () => {
  // local UI state
  const [errorMessage, setErrorMessage] = useState("");
  const [txDetail, setTxDetail] = useState();
  const [orderId, setOrderId] = useState();

  // mobx store that link up with sdk wallets
  const { walletStore, appStore } = useStore();
  const { isInit, chainsAvailable, walletId } = walletStore;
  const { walletId: appStoreWalletId } = appStore;

  // local UI state cleanup when sdk re-initialized
  useEffect(() => {
    setErrorMessage("");
    setTxDetail();
  }, [isInit]);

  // feature logic
  const setupOrderId = (event) => {
    setOrderId(event.target.value);
  };
  const getTransactionDetail = async () => {
    try {
      setErrorMessage("");
      const data = await walletStore.getTransactionDetail(orderId, "0");
      console.log("getTransactionDetail data", data);
      if (data[0]) {
        setTxDetail(data[0]);
      }
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
        key="get-transaction-detail-card"
      >
        <CardContent sx={{ pb: 1 }}>
          <Typography sx={{ fontSize: 26 }}>Get Transaction Detail</Typography>
        </CardContent>
        <Divider flexItem />
        <CardActions sx={{ pl: 2, pr: 2, pb: 2 }}>
          <TextField
            label="Order ID"
            sx={{ pr: 1 }}
            onChange={setupOrderId}
            value={orderId}
          />
          <CardActionButton
            buttonText="Get Transaction Detail"
            onClick={getTransactionDetail}
            disabled={
              !isInit ||
              chainsAvailable?.length === 0 ||
              (!walletId && !appStoreWalletId)
            }
            testId="get-transaction-detail"
          />
        </CardActions>
        {errorMessage && (
          <Alert severity="error">
            <AlertTitle>Failure</AlertTitle>
            {errorMessage}
          </Alert>
        )}
        {txDetail ? (
          <Alert severity="success">
            <AlertTitle>Success</AlertTitle>
            <div>
              <div>{`Transaction Detail: ${txDetail.orderId}`}</div>
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
              <div>{`API Response: ${JSON.stringify(txDetail)}`}</div>
            </div>
          </Alert>
        ) : null}
      </Card>
    </>
  ) : null;
};

export default observer(GetTransactionDetailCard);
