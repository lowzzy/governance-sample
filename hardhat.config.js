require('@nomiclabs/hardhat-waffle');
require('hardhat-gas-reporter');

module.exports = {
  solidity: '0.8.4',
  // https://hardhat.org/metamask-issue.html
  networks: {
    hardhat: {
      chainId: 137,
      allowUnlimitedContractSize: true,
    },
    localhost: { allowUnlimitedContractSize: true },
  },
  gasReporter: {
    enabled: true,
    currency: 'JPY',
    showTimeSpent: true,
    showMethodSig: true,
    // coinmarketcap: 'Key',
    gasPriceApi:
      'https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice',
  },
};
