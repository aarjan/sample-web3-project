import * as dotenv from 'dotenv';

import { HardhatUserConfig, task } from 'hardhat/config';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'solidity-coverage';

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: '0.8.4',
  defaultNetwork: 'blocknet',
  networks: {
    hardhat: {
      // accounts: [
      //   {
      //     balance: '322',
      //     privateKey: process.env.PRIVATE_KEY !== undefined ? process.env.PRIVATE_KEY : '',
      //   },
      // ],
      // forking: {
      //   // url: 'https://eth-mainnet.alchemyapi.io/v2/1YtrYrS2PHYtmo6ypCrGP9EpRolIU2uE',
      //   url: 'https://bsc.getblock.io/mainnet/?api_key=8042d8c8-a768-4b59-91fc-7edf73d309e0',
      //   blockNumber: 14472266,
      // },
    },
    blocknet: {
      url: 'https://bsc.getblock.io/testnet/?api_key=8042d8c8-a768-4b59-91fc-7edf73d309e0',
    },
    testnet: {
      url: 'https://fcurmkqofnfp.usemoralis.com:2053/server',
      chainId: 97,
      gasPrice: 20000000000,
    },
    mainnet: {
      url: 'https://bsc-dataseed.binance.org/',
      chainId: 56,
      gasPrice: 20000000000,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
