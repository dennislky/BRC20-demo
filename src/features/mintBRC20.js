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
import { MINT_BRC20_CODE_URL, OKLINK_TRANSACTION_PREFIX } from "../constants";

// card per feature
const MintBRC20Card = () => {
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
    mintAmount,
    mintOperations,
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
  const updateAddress = (event) => {
    walletStore.setInscribeAddress(event.target.value);
  };
  const updateAmount = (event) => {
    walletStore.setMintAmount(event.target.value);
  };
  const mintBRC20 = async () => {
    try {
      setErrorMessage("");
      await walletStore.mintBRC20();
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
        key="mint-brc20-card"
      >
        <CardContent sx={{ pb: 1 }}>
          <Typography sx={{ fontSize: 26 }}>Mint BRC20</Typography>
          <Typography display="inline" sx={{ fontSize: 16 }}>
            Code Reference:{" "}
          </Typography>
          <Link href={MINT_BRC20_CODE_URL} target="_blank" rel="noopener">
            {MINT_BRC20_CODE_URL}
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
            onChange={updateAddress}
            value={fromAddress || inscribeAddress}
          />
          <TextField
            label="Mint Amount"
            sx={{ pr: 1 }}
            onChange={updateAmount}
            type="number"
            value={mintAmount}
          />
          <CardActionButton
            buttonText="Mint"
            onClick={mintBRC20}
            disabled={
              !isInit ||
              chainsAvailable?.length === 0 ||
              (!walletId && !appStoreWalletId) ||
              !tickName
            }
            testId="mint-brc20"
          />
        </CardActions>
        {errorMessage && (
          <Alert severity="error">
            <AlertTitle>Failure</AlertTitle>
            {errorMessage}
          </Alert>
        )}
        {mintOperations && Object.keys(mintOperations).length ? (
          <div>
            {mintOperations.signInfo && (
              <Alert severity="success" sx={{ "overflow-wrap": "break-word" }}>
                <AlertTitle>Get Sign Info</AlertTitle>
                {Object.entries(mintOperations.signInfo).map((entry, index) => {
                  return (
                    <div key={`sign-info-entry-${index}`}>
                      {`${entry[0]}: ${JSON.stringify(entry[1])}`}
                    </div>
                  );
                })}
              </Alert>
            )}
            {mintOperations.utxo && (
              <Alert severity="success" sx={{ "overflow-wrap": "break-word" }}>
                <AlertTitle>Get UTXO</AlertTitle>
                {Object.entries(mintOperations.utxo).map((entry, index) => {
                  return (
                    <div key={`utxo-entry-${index}`}>
                      {`${entry[0]}: ${JSON.stringify(entry[1])}`}
                    </div>
                  );
                })}
              </Alert>
            )}
            {mintOperations.op && (
              <Alert severity="success" sx={{ "overflow-wrap": "break-word" }}>
                <AlertTitle>Construct Inscribe Operation</AlertTitle>
                {Object.entries(mintOperations.op).map((entry, index) => {
                  return (
                    <div key={`op-entry-${index}`}>
                      {`${entry[0]}: ${JSON.stringify(entry[1])}`}
                    </div>
                  );
                })}
              </Alert>
            )}
            {mintOperations.inscribedTxs && (
              <Alert severity="success" sx={{ "overflow-wrap": "break-word" }}>
                <AlertTitle>Construct Transaction</AlertTitle>
                {Object.entries(mintOperations.inscribedTxs).map(
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
            {mintOperations.txHashList && (
              <Alert>
                <AlertTitle>Broadcast Transaction</AlertTitle>
                {Object.entries(mintOperations.inscribedTxs).map(
                  (entry, index) => {
                    return (
                      <div key={`op-entry-${index}`}>
                        {`${entry[0]}: ${JSON.stringify(entry[1])}`}
                      </div>
                    );
                  }
                )}
                {mintOperations.txHashList.result &&
                  mintOperations.txHashList.result.map((tx, txIndex) => {
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
                        {txIndex < mintOperations.txHashList.length ? (
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

export default observer(MintBRC20Card);
