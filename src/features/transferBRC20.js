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
import {
  OKLINK_TRANSACTION_PREFIX,
  TRANSFER_BRC20_CODE_URL,
} from "../constants";

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
          <Typography display="inline" sx={{ fontSize: 16 }}>
            Code Reference:{" "}
          </Typography>
          <Link href={TRANSFER_BRC20_CODE_URL} target="_blank" rel="noopener">
            {TRANSFER_BRC20_CODE_URL}
          </Link>
        </CardContent>
        <Divider flexItem />
        <CardActions sx={{ pl: 2, pr: 2, pb: 2 }}>
          <TextField
            label="Tick Name"
            sx={{ pr: 1 }}
            onChange={updateTickName}
            value={tickName}
            helperText="4 alphanumeric characters"
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
              (!walletId && !appStoreWalletId) ||
              !tickName
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
          <div>
            {transferOperations.signInfo && (
              <Alert severity="success" sx={{ "overflow-wrap": "break-word" }}>
                <AlertTitle>Get Sign Info</AlertTitle>
                {Object.entries(transferOperations.signInfo).map(
                  (entry, index) => {
                    return (
                      <div key={`sign-info-entry-${index}`}>
                        {`${entry[0]}: ${JSON.stringify(entry[1])}`}
                      </div>
                    );
                  }
                )}
              </Alert>
            )}
            {transferOperations.utxo && (
              <Alert severity="success" sx={{ "overflow-wrap": "break-word" }}>
                <AlertTitle>Get UTXO</AlertTitle>
                {Object.entries(transferOperations.utxo).map((entry, index) => {
                  return (
                    <div key={`utxo-entry-${index}`}>
                      {`${entry[0]}: ${JSON.stringify(entry[1])}`}
                    </div>
                  );
                })}
              </Alert>
            )}
            {transferOperations.op && (
              <Alert severity="success" sx={{ "overflow-wrap": "break-word" }}>
                <AlertTitle>Construct Inscribe Operation</AlertTitle>
                {Object.entries(transferOperations.op).map((entry, index) => {
                  return (
                    <div key={`op-entry-${index}`}>
                      {`${entry[0]}: ${JSON.stringify(entry[1])}`}
                    </div>
                  );
                })}
              </Alert>
            )}
            {transferOperations.inscribedTxs && (
              <Alert severity="success" sx={{ "overflow-wrap": "break-word" }}>
                <AlertTitle>Construct Transaction</AlertTitle>
                {Object.entries(transferOperations.inscribedTxs).map(
                  (entry, index) => {
                    return (
                      <div key={`op-entry-${index}`}>
                        {`${entry[0]}: ${JSON.stringify(entry[1])}`}
                      </div>
                    );
                  }
                )}
              </Alert>
            )}
            {transferOperations.txHashList && (
              <Alert>
                <AlertTitle>Broadcast Transaction</AlertTitle>
                {Object.entries(transferOperations.txHashList).map(
                  (entry, index) => {
                    return (
                      <div key={`op-entry-${index}`}>
                        {`${entry[0]}: ${JSON.stringify(entry[1])}`}
                      </div>
                    );
                  }
                )}
                {transferOperations.txHashList.result &&
                  transferOperations.txHashList.result.map((tx, txIndex) => {
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
            )}
          </div>
        ) : null}
      </Card>
    </>
  ) : null;
};

export default observer(TransferBRC20Card);
