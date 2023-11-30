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
  const { walletStore } = useStore();
  const { isInit, chainsAvailable, walletId } = walletStore;

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
      console.log(data);
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
            disabled={!isInit || chainsAvailable?.length === 0 || !walletId}
            testId="get-balance"
          />
        </CardActions>
        {errorMessage && (
          <Alert severity="error">
            <AlertTitle>Failure</AlertTitle>
            {errorMessage}
          </Alert>
        )}
        {balances ? (
          <Alert severity="success">
            <AlertTitle>Success</AlertTitle>
            <strong>
              Token Balances:{" "}
              {balances[0].tokenAssets.map((balance) => {
                return (
                  <div>
                    {balance.symbol}: {balance.balance}
                  </div>
                );
              })}
            </strong>
            {/* <strong>BRC20 Balances: {balances[0].brc20TokenAssets.map(balance => {
              return (
                <div>
                  <p>{balance.symbol}: {balance.balance}</p>
                </div>
              )
            })}</strong> */}
          </Alert>
        ) : null}
      </Card>
    </>
  ) : null;
};

export default observer(GetBalanceCard);
