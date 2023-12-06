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
} from "@mui/material";

import { CardActionButton } from "../components/CardActionButton";
import { useStore } from "../stores";

// card per feature
const TransferBRC20Card = () => {
  // local UI state
  const [errorMessage, setErrorMessage] = useState("");

  // mobx store that link up with sdk wallets
  const { walletStore, appStore } = useStore();
  const {
    isInit,
    chainsAvailable,
    walletId,
    inscribeAddress,
    // transferAddress,
    transferAmount,
    transferTxHashList,
  } = walletStore;
  const { fromAddress, walletId: appStoreWalletId } = appStore;

  // local UI state cleanup when sdk re-initialized
  useEffect(() => {
    setErrorMessage("");
  }, [isInit]);

  // feature logic
  const updateInscribeAddress = (event) => {
    walletStore.setInscribeAddress(event.target.value);
  };
  // const updateTransferAddress = (event) => {
  //   walletStore.setTransferAddress(event.target.value);
  // };
  const updateAmount = (event) => {
    walletStore.setTransferAmount(event.target.value);
  };
  const transferBRC20 = async () => {
    try {
      setErrorMessage("");
      await walletStore.transferBRC20();
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
        key="transfer-brc20-card"
      >
        <CardContent sx={{ pb: 1 }}>
          <Typography sx={{ fontSize: 26 }}>Transfer BRC20</Typography>
        </CardContent>
        <Divider flexItem />
        <CardActions sx={{ pl: 2, pr: 2, pb: 2 }}>
          <TextField
            label="Inscribe Address"
            sx={{ pr: 1 }}
            onChange={updateInscribeAddress}
            value={fromAddress || inscribeAddress}
          />
          {/* <TextField
            label="Transfer Address"
            sx={{ pr: 1 }}
            onChange={updateTransferAddress}
            value={transferAddress}
          /> */}
          <TextField
            label="Transfer Amount"
            sx={{ pr: 1 }}
            onChange={updateAmount}
            type="number"
            value={transferAmount}
          />
          <CardActionButton
            buttonText="Transfer"
            onClick={transferBRC20}
            disabled={
              !isInit ||
              chainsAvailable?.length === 0 ||
              (!walletId && !appStoreWalletId)
            }
            testId="transfer-brc20"
          />
        </CardActions>
        {errorMessage && (
          <Alert severity="error">
            <AlertTitle>Failure</AlertTitle>
            {errorMessage}
          </Alert>
        )}
        {transferTxHashList && transferTxHashList.length ? (
          <Alert severity="success">
            <AlertTitle>Success</AlertTitle>
            <strong>
              Transaction Hashes:
              {transferTxHashList.map((data, index) => {
                return (
                  <p key={`data-${index}`}>
                    <div>{`Operation: ${JSON.stringify(data.op)}`}</div>
                    {data.txHashList.map((tx, txIndex) => {
                      return (
                        <div
                          key={`tx-${txIndex}`}
                        >{`${tx.itemId} Transaction Hash: ${tx.txHash}`}</div>
                      );
                    })}
                  </p>
                );
              })}
            </strong>
          </Alert>
        ) : null}
      </Card>
    </>
  ) : null;
};

export default observer(TransferBRC20Card);
