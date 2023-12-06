import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";

import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  TextField,
  Link,
} from "@mui/material";

import { CardActionButton } from "../components/CardActionButton";
import { DemoDialog } from "../components/DemoDialog";
import { useStore } from "../stores";
import { OKLINK_ADDRESS_PREFIX, OKX_BUILD_URL } from "../constants";

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
    // toAddress,
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
  // const setupToAddress = (event) => {
  //   appStore.setToAddress(event.target.value);
  // };
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
            Configurations
          </Typography>
          {isInit && (
            <Typography display="inline" sx={{ fontSize: 14, color: "blue" }}>
              {" (Initialized)"}
            </Typography>
          )}
        </CardContent>
        <CardContent sx={{ pb: 1 }}>
          <Typography display="inline" sx={{ fontSize: 16 }}>
            OKX Build Configurations:{" "}
          </Typography>
          <Link href={OKX_BUILD_URL} target="_blank" rel="noopener">
            {OKX_BUILD_URL}
          </Link>
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
        <CardContent sx={{ pb: 1 }}>
          <Typography display="inline" sx={{ fontSize: 16 }}>
            Wallet Import Configurations
          </Typography>
        </CardContent>
        <CardActions sx={{ pl: 2, pr: 2, pb: 2 }}>
          <TextField
            label="Wallet ID"
            sx={{ pr: 1 }}
            onChange={setupWalletId}
            value={walletId}
            helperText="optional, if provided, please also provide corresponding API Key"
          />
          <TextField
            label="From Address"
            sx={{ pr: 1 }}
            onChange={setupFromAddress}
            value={fromAddress}
          />
          {/* <TextField
            label="To Address"
            sx={{ pr: 1 }}
            onChange={setupToAddress}
            value={toAddress}
          /> */}
          <TextField
            label="Private Key"
            sx={{ pr: 1 }}
            onChange={setupPrivateKey}
            type="password"
            value={privateKey}
          />
        </CardActions>
        {fromAddress ? (
          <CardActions sx={{ pl: 2, pr: 2, pb: 2 }}>
            <Typography display="inline" sx={{ fontSize: 16 }}>
              Inscription List:{" "}
            </Typography>
            <Link
              href={`${OKLINK_ADDRESS_PREFIX}${fromAddress}/inscription`}
              target="_blank"
              rel="noopener"
            >
              {`${OKLINK_ADDRESS_PREFIX}/${fromAddress}/inscription`}
            </Link>
          </CardActions>
        ) : null}
        {/* {toAddress ? (
          <CardActions sx={{ pl: 2, pr: 2, pb: 2 }}>
            <Typography display="inline" sx={{ fontSize: 16 }}>
              To Address Inscription Link:{" "}
            </Typography>
            <Link
              href={`${OKLINK_ADDRESS_PREFIX}/${toAddress}/inscription`}
              target="_blank"
              rel="noopener"
            >
              {`${OKLINK_ADDRESS_PREFIX}/${toAddress}/inscription`}
            </Link>
          </CardActions>
        ) : null} */}
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
              src="https://ghbtns.com/github-btn.html?user=dennislky&repo=BRC20-Demo&type=star&count=true&size=large"
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
