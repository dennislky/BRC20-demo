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
const GetBalanceCard = () => {
  // local UI state
  const [errorMessage, setErrorMessage] = useState("");
  const [balances, setBalances] = useState();

  // mobx store that link up with sdk wallets
  const { walletStore, appStore } = useStore();
  const { isInit, chainsAvailable, walletId } = walletStore;
  const { walletId: appStoreWalletId } = appStore;

  // local UI state cleanup when sdk re-initialized
  useEffect(() => {
    setErrorMessage("");
    setBalances();
  }, [isInit]);

  // feature logic
  const getBalance = async () => {
    try {
      setErrorMessage("");
      const data = await walletStore.getBalance();
      setBalances(data);
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
        key="get-balance-card"
      >
        <CardContent sx={{ pb: 1 }}>
          <Typography sx={{ fontSize: 26 }}>Get Balance</Typography>
        </CardContent>
        <Divider flexItem />
        <CardActions sx={{ pl: 2, pr: 2, pb: 2 }}>
          <CardActionButton
            buttonText="Get Balance"
            onClick={getBalance}
            disabled={
              !isInit ||
              chainsAvailable?.length === 0 ||
              (!walletId && !appStoreWalletId)
            }
            testId="get-balance"
          />
        </CardActions>
        {errorMessage && (
          <Alert severity="error">
            <AlertTitle>Failure</AlertTitle>
            {errorMessage}
          </Alert>
        )}
        {balances && balances.length ? (
          <div>
            <Alert severity="success">
              <AlertTitle>Token Balances</AlertTitle>
              {balances[0].tokenAssets.map((balance, index) => {
                return (
                  <div key={`token-assets-${index}`}>
                    <div>
                      {balance.balance} {balance.symbol}
                    </div>
                    {index < balances[0].tokenAssets.length - 1 ? <br /> : null}
                  </div>
                );
              })}
            </Alert>
            <Alert severity="success">
              <AlertTitle>BRC20 Balances</AlertTitle>
              {balances[0].brc20TokenAssets.map((balance, index) => {
                return (
                  <div key={`brc20-token-assets-${index}`}>
                    <div>
                      {balance.symbol}: Total Balance: {balance.totalBalance},
                      Available Balance: {balance.availableBalance},
                      Transferable Balance: {balance.transferableBalance}
                    </div>
                    {index < balances[0].brc20TokenAssets.length - 1 ? (
                      <br />
                    ) : null}
                  </div>
                );
              })}
            </Alert>
          </div>
        ) : null}
      </Card>
    </>
  ) : null;
};

export default observer(GetBalanceCard);
