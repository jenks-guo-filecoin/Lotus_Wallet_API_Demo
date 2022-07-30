import {useState, useEffect} from 'react';
import './App.css';
import {  AppBar, Button, Toolbar, Typography, Box, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Radio} from '@mui/material';
import { TabPanel, TabContext, TabList } from '@mui/lab';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { HttpJsonRpcConnector, LotusWalletProvider, LotusClient } from 'filecoin.js';
import Promise from 'promise';

function App() {
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    updateWallet();
  }, [])

  const getLotusWalletClient = () => {
    const connector = new HttpJsonRpcConnector({ url: "/rpc/v0", token: process.env.REACT_APP_LOTUS_API_TOKEN });

    const client = new LotusClient(connector);

    const walletLotusHttp = new LotusWalletProvider(client);

    return walletLotusHttp;
  }

  const updateWallet = async () => {
    const walletLotusHttp = getLotusWalletClient()

    var walletAddrList = await walletLotusHttp.getAddresses();
    var walletDefaultAddr = await walletLotusHttp.getDefaultAddress();

    let newWallets = [];

    await Promise.all(
      walletAddrList.map(
        async (addr) => {
          var wallet = {
            address: '',
            balance: 0,
            default: false
          }

          wallet.address = addr;
          wallet.balance = await walletLotusHttp.getBalance(addr);
          wallet.default = (addr === walletDefaultAddr);
          newWallets.push(wallet);
        }
      )
    );

    setWallets(newWallets);
  }

  const deleteWallet = async (addr) => {
    const walletLotusHttp = getLotusWalletClient()
    
    await walletLotusHttp.deleteAddress(addr);

    updateWallet();
  }

  const createWallet = async (addr) => {
    const walletLotusHttp = getLotusWalletClient()
    
    await walletLotusHttp.newAddress();

    updateWallet();
  }

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography variant="h6" color="inherit" component="div">
            Lotus Wallet App Demo
          </Typography>
        </Toolbar>
      </AppBar>

      <TabContext value="1">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList>
            <Tab label="Wallet" value="1" />
          </TabList>
        </Box>

        <TabPanel value="1"> 
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow >
                  <TableCell></TableCell>
                  <TableCell align="left">Address</TableCell>
                  <TableCell align="left">Balance</TableCell>
                  <TableCell align="left">Default</TableCell>
                  <TableCell align="left"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  wallets.map((w, i) => {
                    return (
                    <TableRow
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }} 
                      key={i}
                    >
                      <TableCell component="th" scope="row">
                        <AccountBalanceWalletIcon/>
                      </TableCell>

                      <TableCell align="left">{w.address}</TableCell>

                      <TableCell align="left">{w.balance}</TableCell>

                      <TableCell align="left">
                        <Radio
                          checked={w.default}
                          name="radio-buttons"
                          inputProps={{ 'aria-label': 'A' }}
                        />
                      </TableCell>
            
                      <TableCell align="left">
                        <Button variant="contained" color="error" onClick={() => deleteWallet(w.address)}>Delete</Button>
                      </TableCell>

                    </TableRow>
                    )
                  })
                }
              </TableBody>
            </Table>
          </TableContainer>

          <div> 
            <br/>
            <Button
              variant="contained"
              color="success" 
              onClick={() => createWallet()}
            >
              Create New Wallet
            </Button>
          </div>
        
        </TabPanel>
      </TabContext>
    </div>
  );

}

export default App;