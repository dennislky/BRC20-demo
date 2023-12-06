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
const TransferBRC20Card = () => {
  // local UI state
  const [errorMessage, setErrorMessage] = useState("");

  // mobx store that link up with sdk wallets
  const { walletStore, appStore } = useStore();
  const {
    isInit,
    chainsAvailable,
    walletId,
    tickName,
    inscribeAddress,
    transferAmount,
    transferOperations,
  } = walletStore;
  const { fromAddress, walletId: appStoreWalletId } = appStore;

  // local UI state cleanup when sdk re-initialized
  useEffect(() => {
    setErrorMessage("");
  }, [isInit]);

  // feature logic
  const updateTickName = (event) => {
    walletStore.setTickName(event.target.value);
  };
  const updateInscribeAddress = (event) => {
    walletStore.setInscribeAddress(event.target.value);
  };
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
            label="Tick Name"
            sx={{ pr: 1 }}
            onChange={updateTickName}
            value={tickName}
          />
          <TextField
            label="Inscribe Address"
            sx={{ pr: 1 }}
            onChange={updateInscribeAddress}
            value={fromAddress || inscribeAddress}
          />
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
        {transferOperations && Object.keys(transferOperations).length ? (
          <Alert severity="success">
            <AlertTitle>Transactions</AlertTitle>
            <div>{`Sign Info: ${JSON.stringify(
              transferOperations.signInfo
            )}`}</div>
            {transferOperations.utxo && <br />}
            {transferOperations.utxo && (
              <div>{`UTXO: ${JSON.stringify(transferOperations.utxo)}`}</div>
            )}
            {transferOperations.op && <br />}
            {transferOperations.op && (
              <div>{`Operation: ${JSON.stringify(transferOperations.op)}`}</div>
            )}
            {transferOperations.inscribedTxs && <br />}
            {transferOperations.inscribedTxs && (
              <div>{`Inscribed Transactions: ${JSON.stringify(
                transferOperations.inscribedTxs
              )}`}</div>
            )}
            {transferOperations.txHashList &&
              transferOperations.txHashList.map((tx, txIndex) => {
                return (
                  <div key={`tx-${txIndex}`}>
                    <div>{`${tx.itemId} transaction link: `}</div>
                    <Link
                      href={`${OKLINK_TRANSACTION_PREFIX}${tx.txHash}`}
                      target="_blank"
                      rel="noopener"
                    >
                      {`${OKLINK_TRANSACTION_PREFIX}${tx.txHash}`}
                    </Link>
                    {txIndex < transferOperations.txHashList.length ? (
                      <br />
                    ) : null}
                  </div>
                );
              })}
          </Alert>
        ) : null}
      </Card>
    </>
  ) : null;
};

export default observer(TransferBRC20Card);
