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
} from "@mui/material";

import { CardActionButton } from "../components/CardActionButton";
import { useStore } from "../stores";

// card per feature
const CreateWalletCard = () => {
  // local UI state
  const [errorMessage, setErrorMessage] = useState("");

  // mobx store that link up with sdk wallets
  const { walletStore, appStore } = useStore();
  const { isInit, chainsAvailable, walletId } = walletStore;
  const { walletId: appStoreWalletId } = appStore;

  // local UI state cleanup when sdk re-initialized
  useEffect(() => {
    setErrorMessage("");
  }, [isInit]);

  // feature logic
  const createWallet = async () => {
    try {
      setErrorMessage("");
      await walletStore.createWallet();
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
        key="create-wallet-card"
      >
        <CardContent sx={{ pb: 1 }}>
          <Typography sx={{ fontSize: 26 }}>Create Wallet</Typography>
        </CardContent>
        <Divider flexItem />
        <CardActions sx={{ pl: 2, pr: 2, pb: 2 }}>
          <CardActionButton
            buttonText="Create Wallet"
            onClick={createWallet}
            disabled={
              !isInit ||
              chainsAvailable?.length === 0 ||
              !!walletId ||
              !!appStoreWalletId
            }
            testId="create-wallet"
          />
        </CardActions>
        {errorMessage && (
          <Alert severity="error">
            <AlertTitle>Failure</AlertTitle>
            {errorMessage}
          </Alert>
        )}
        {walletId ? (
          <Alert severity="success">
            <AlertTitle>Success</AlertTitle>
            <strong>Wallet ID: {walletId}</strong>
          </Alert>
        ) : null}
      </Card>
    </>
  ) : null;
};

export default observer(CreateWalletCard);
