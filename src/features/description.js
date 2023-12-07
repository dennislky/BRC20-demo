import { observer } from "mobx-react-lite";

import { Card, CardContent, Typography } from "@mui/material";

const InitSDKCard = () => {
  return (
    <>
      <Card variant="outlined" sx={{ minWidth: 275, borderRadius: 5 }}>
        <CardContent sx={{ pb: 1 }}>
          <Typography sx={{ fontSize: 26 }}>Demo Description</Typography>
          <br />
          <Typography>
            This demo showcases how to use the OKX SDK for BRC20 transactions,
            including the following main steps:
          </Typography>
          <br />
          <Typography>• Creating a BRC20-supported address</Typography>
          <Typography>
            • Constructing & broadcasting BRC20 transactions
          </Typography>
          <br />
          <Typography>Operating Guide</Typography>
          <br />
          <Typography>
            1. Obtain API key and other information from OKX BUILD and configure
            OKX Build Configurations.
          </Typography>
          <Typography>2. Click the [INITIALIZE] button.</Typography>
          <Typography>
            3. Create a new mnemonic and taproot address, then click [CREATE
            WALLET] to obtain the Wallet ID.
          </Typography>
          <Typography>4. Fill in the Wallet Import Configurations.</Typography>
          <Typography>
            5. Enter the name of the BRC20 token you want to operate with, then
            click the appropriate button to view relevant examples.
          </Typography>
          <br />
          <Typography>Notes</Typography>
          <br />
          <Typography>
            1. This demo is for functional demonstration purposes only and will
            never record or upload your sensitive information such as private
            keys or API keys. It is recommended to perform operations in a local
            environment.
          </Typography>
          <Typography>
            2. Some functionalities of this demo rely on the OKX Wallet API.
            Please ensure that you provide the correct configuration
            information.
          </Typography>
          <Typography>
            3. BRC20 signing requires the address to have UTXOs. If using a
            newly created address, the construction of BRC20 transactions will
            be based on mock data.
          </Typography>
        </CardContent>
      </Card>
    </>
  );
};

export default observer(InitSDKCard);
