const secrets = require('./secrets')
const HDWalletProvider = require('truffle-hdwallet-provider')

const mnemonic = secrets.mnemonic

module.exports = {
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    stage: {
      provider: function () {
        return new HDWalletProvider(mnemonic, 'https://parity.tp.ntr1x.com:8545')
      },
      network_id: 88,
      gas: 4700000,
      gasPrice: 0x01
    },
    kovan: {
      provider: function () {
        return new HDWalletProvider(mnemonic, 'https://kovan.infura.io/V7bcR20F3X5Kyg7GBH2M')
      },
      network_id: 42,
      gas: 4700000,
      gasPrice: 0x50
    },
    ganache: {
      provider: function () {
        return new HDWalletProvider(mnemonic, 'http://127.0.0.1:7545')
      },
      network_id: 5777,
      gas: 4700000,
      gasPrice: 0x01
    },
    testrpc: {
      network_id: 'default'
    }
  }
}
