import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";

import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  TextField,
} from "@mui/material";

import { CardActionButton } from "../components/CardActionButton";
import { DemoDialog } from "../components/DemoDialog";
import { useStore } from "../stores";

// card per feature
const InitSDKCard = () => {
  // local UI state
  const [showDialog, setShowDialog] = useState(false);

  // mobx store that link up with sdk wallets
  const { appStore, walletStore } = useStore();
  const { isInit } = walletStore;
  const {
    apiKey,
    apiProjectId,
    apiPassphrase,
    apiSecretKey,
    fromAddress,
    toAddress,
    walletId,
    privateKey,
  } = appStore;

  // local UI state cleanup when sdk re-initialized
  useEffect(() => {
    setShowDialog(false);
  }, [isInit]);

  // event handler
  const confirmDialog = () => {
    walletStore.dispose();
    appStore.dispose();
    setShowDialog(false);
  };
  const closeDialog = () => {
    setShowDialog(false);
  };

  // feature logic
  const setupAPIKey = (event) => {
    appStore.setAPIKey(event.target.value);
  };
  const setupAPIProjectId = (event) => {
    appStore.setAPIProjectId(event.target.value);
  };
  const setupAPIPassphrase = (event) => {
    appStore.setAPIPassphrase(event.target.value);
  };
  const setupAPISecretKey = (event) => {
    appStore.setAPISecretKey(event.target.value);
  };

  const setupFromAddress = (event) => {
    appStore.setFromAddress(event.target.value);
  };
  const setupToAddress = (event) => {
    appStore.setToAddress(event.target.value);
  };
  const setupWalletId = (event) => {
    appStore.setWalletId(event.target.value);
  };
  const setupPrivateKey = (event) => {
    appStore.setPrivateKey(event.target.value);
  };

  const initSDK = () => {
    walletStore.initialize();
  };
  const dispose = () => {
    setShowDialog(true);
  };

  // render logic
  return (
    <>
      <Card variant="outlined" sx={{ minWidth: 275, borderRadius: 5 }}>
        <CardContent sx={{ pb: 1 }}>
          <Typography display="inline" sx={{ fontSize: 26 }}>
            OKX Wallet SDK
          </Typography>
          {isInit && (
            <Typography display="inline" sx={{ fontSize: 14, color: "blue" }}>
              {" (Initialized)"}
            </Typography>
          )}
        </CardContent>
        <CardActions sx={{ pl: 2, pr: 2, pb: 2 }}>
          <TextField
            label="API Key"
            sx={{ pr: 1 }}
            onChange={setupAPIKey}
            value={apiKey}
          />
          <TextField
            label="API Project ID"
            sx={{ pr: 1 }}
            onChange={setupAPIProjectId}
            value={apiProjectId}
          />
          <TextField
            label="API Passphrase"
            sx={{ pr: 1 }}
            onChange={setupAPIPassphrase}
            type="password"
            value={apiPassphrase}
          />
          <TextField
            label="API Secret Key"
            sx={{ pr: 1 }}
            onChange={setupAPISecretKey}
            type="password"
            value={apiSecretKey}
          />
        </CardActions>
        <CardActions sx={{ pl: 2, pr: 2, pb: 2 }}>
          <TextField
            label="From Address"
            sx={{ pr: 1 }}
            onChange={setupFromAddress}
            value={fromAddress}
          />
          <TextField
            label="To Address"
            sx={{ pr: 1 }}
            onChange={setupToAddress}
            value={toAddress}
          />
          <TextField
            label="Wallet ID"
            sx={{ pr: 1 }}
            onChange={setupWalletId}
            value={walletId}
          />
          <TextField
            label="Private Key"
            sx={{ pr: 1 }}
            onChange={setupPrivateKey}
            type="password"
            value={privateKey}
          />
        </CardActions>
        <CardActions sx={{ pl: 2, pr: 2, pb: 2 }}>
          {!isInit ? (
            <CardActionButton
              buttonText="Initialize"
              onClick={initSDK}
              testId="initialize"
            />
          ) : (
            <CardActionButton
              buttonText="Dispose"
              onClick={dispose}
              testId="dispose"
            />
          )}
          {/* <CardActionButton buttonText="Github" onClick={linkToGithub} /> */}
          <Grid
            container
            spacing={1}
            sx={{
              ml: 1,
              mt: 0,
            }}
          >
            <iframe
              src="https://ghbtns.com/github-btn.html?user=okx&repo=js-wallet-sdk-demo&type=star&count=true&size=large"
              frameBorder="0"
              width="170"
              height="30"
              title="GitHub"
            />
          </Grid>
        </CardActions>
      </Card>
      <DemoDialog
        title={"Are you sure?"}
        content={"The Mnenomics and Private Keys generated will be lost!"}
        showDialog={showDialog}
        handleClose={closeDialog}
        handleConfirm={confirmDialog}
      />
    </>
  );
};

export default observer(InitSDKCard);
