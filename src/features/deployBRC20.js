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
  DEPLOY_BRC20_CODE_URL,
  OKLINK_BRC20_LIST_URL,
  OKLINK_TRANSACTION_PREFIX,
} from "../constants";

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
    tickName,
    inscribeAddress,
    deployAmount,
    deployLimit,
    deployOperations,
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
          <Typography display="inline" sx={{ fontSize: 16 }}>
            Code Reference:{" "}
          </Typography>
          <Link href={DEPLOY_BRC20_CODE_URL} target="_blank" rel="noopener">
            {DEPLOY_BRC20_CODE_URL}
          </Link>
        </CardContent>
        <Divider flexItem />
        <CardContent sx={{ pb: 1 }}>
          <Typography display="inline" sx={{ fontSize: 16 }}>
            Please check if your proposed tick name already exists:{" "}
          </Typography>
          <Link href={OKLINK_BRC20_LIST_URL} target="_blank" rel="noopener">
            {OKLINK_BRC20_LIST_URL}
          </Link>
        </CardContent>
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
              (!walletId && !appStoreWalletId) ||
              !tickName
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
        {deployOperations && Object.keys(deployOperations).length ? (
          <div>
            {deployOperations.signInfo && (
              <Alert severity="success" sx={{ "overflow-wrap": "break-word" }}>
                <AlertTitle>Get Sign Info</AlertTitle>
                {Object.entries(deployOperations.signInfo).map(
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
            {deployOperations.utxo && (
              <Alert severity="success" sx={{ "overflow-wrap": "break-word" }}>
                <AlertTitle>Get UTXO</AlertTitle>
                {Object.entries(deployOperations.utxo).map((entry, index) => {
                  return (
                    <div key={`utxo-entry-${index}`}>
                      {`${entry[0]}: ${JSON.stringify(entry[1])}`}
                    </div>
                  );
                })}
              </Alert>
            )}
            {deployOperations.op && (
              <Alert severity="success" sx={{ "overflow-wrap": "break-word" }}>
                <AlertTitle>Construct Inscribe Operation</AlertTitle>
                {Object.entries(deployOperations.op).map((entry, index) => {
                  return (
                    <div key={`op-entry-${index}`}>
                      {`${entry[0]}: ${JSON.stringify(entry[1])}`}
                    </div>
                  );
                })}
              </Alert>
            )}
            {deployOperations.inscribedTxs && (
              <Alert severity="success" sx={{ "overflow-wrap": "break-word" }}>
                <AlertTitle>Construct Transaction</AlertTitle>
                {Object.entries(deployOperations.inscribedTxs).map(
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
            {deployOperations.txHashList && (
              <Alert>
                <AlertTitle>Broadcast Transaction</AlertTitle>
                {Object.entries(deployOperations.inscribedTxs).map(
                  (entry, index) => {
                    return (
                      <div key={`op-entry-${index}`}>
                        {`${entry[0]}: ${JSON.stringify(entry[1])}`}
                      </div>
                    );
                  }
                )}
                {deployOperations.txHashList.result &&
                  deployOperations.txHashList.result.map((tx, txIndex) => {
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
                        {txIndex < deployOperations.txHashList.length ? (
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

export default observer(DeployBRC20Card);
