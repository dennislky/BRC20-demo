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
const DeployBRC20Card = () => {
  // local UI state
  const [errorMessage, setErrorMessage] = useState("");

  // mobx store that link up with sdk wallets
  const { walletStore, appStore } = useStore();
  const {
    isInit,
    chainsAvailable,
    walletId,
    inscribeAddress,
    deployAmount,
    deployLimit,
    deployTxHashList,
  } = walletStore;
  const { fromAddress, walletId: appStoreWalletId } = appStore;

  // local UI state cleanup when sdk re-initialized
  useEffect(() => {
    setErrorMessage("");
  }, [isInit]);

  // feature logic
  const updateAddress = (event) => {
    walletStore.setInscribeAddress(event.target.value);
  };
  const updateAmount = (event) => {
    walletStore.setDeployAmount(event.target.value);
  };
  const updateLimit = (event) => {
    walletStore.setDeployLimit(event.target.value);
  };
  const deployBRC20 = async () => {
    try {
      setErrorMessage("");
      await walletStore.deployBRC20();
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
        key="deploy-brc20-card"
      >
        <CardContent sx={{ pb: 1 }}>
          <Typography sx={{ fontSize: 26 }}>Deploy BRC20</Typography>
        </CardContent>
        <Divider flexItem />
        <CardActions sx={{ pl: 2, pr: 2, pb: 2 }}>
          <TextField
            label="Inscribe Address"
            sx={{ pr: 1 }}
            onChange={updateAddress}
            value={fromAddress || inscribeAddress}
          />
          <TextField
            label="Deploy Amount"
            sx={{ pr: 1 }}
            onChange={updateAmount}
            type="number"
            value={deployAmount}
          />
          <TextField
            label="Mint Limit"
            sx={{ pr: 1 }}
            onChange={updateLimit}
            type="number"
            value={deployLimit}
          />
          <CardActionButton
            buttonText="Deploy"
            onClick={deployBRC20}
            disabled={
              !isInit ||
              chainsAvailable?.length === 0 ||
              (!walletId && !appStoreWalletId)
            }
            testId="deploy-brc20"
          />
        </CardActions>
        {errorMessage && (
          <Alert severity="error">
            <AlertTitle>Failure</AlertTitle>
            {errorMessage}
          </Alert>
        )}
        {deployTxHashList && deployTxHashList.length ? (
          <Alert severity="success">
            <AlertTitle>Success</AlertTitle>
            <strong>
              Transaction Hashes:
              {deployTxHashList.map((data, index) => {
                return (
                  <div key={`data-${index}`}>
                    <div>{`Operation: ${JSON.stringify(data.op)}`}</div>
                    {data.txHashList.map((tx, txIndex) => {
                      return (
                        <div
                          key={`tx-${txIndex}`}
                        >{`${tx.itemId} Transaction Hash: ${tx.txHash}`}</div>
                      );
                    })}
                  </div>
                );
              })}
            </strong>
          </Alert>
        ) : null}
      </Card>
    </>
  ) : null;
};

export default observer(DeployBRC20Card);
