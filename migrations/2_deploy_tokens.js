const EIP20Factory = artifacts.require('./EIP20Factory.sol')
const EIP20 = artifacts.require('./EIP20.sol')
const MintableAndBurnableToken = artifacts.require('./MintableAndBurnableToken.sol')
const WrappedEtherToken = artifacts.require('./WrappedEtherToken.sol')
const { saveDeployedAddresses } = require('./utils')

const MILLION = 100000000 // '1000000000000000000000000'

const ERC20_TOKENS = [
  {
    holder: '0x1134cc86b45039cc211c6d1d2e4b3c77f60207ed',
    name: 'IP Token',
    symbol: 'IPT',
    decimals: '18',
    initialAmount: MILLION
  },
  {
    holder: '0x623ec1e5096d5a682967e7994401173845763b44',
    name: 'MK Token',
    symbol: 'MKT',
    decimals: '18',
    initialAmount: MILLION
  },
  {
    holder: '0x90892995479b0b96cea0bc332620d7464e0e6692',
    name: 'AK Token',
    symbol: 'AKT',
    decimals: '8',
    initialAmount: MILLION
  },
  {
    holder: '0x0bab5d88475978a4eaa6001bd8e7c1350afb3485',
    name: 'RL Token',
    symbol: 'RLT',
    decimals: '8',
    initialAmount: MILLION
  },
  {
    holder: '0xa8e70519d5bc5b548d6fc490bf39c4288d1286c7',
    name: 'AV Token',
    symbol: 'AVT',
    decimals: '8',
    initialAmount: MILLION
  },
  {
    holder: '0x2943ad6701ee8c0d1fa307ac17f8c475da2d39f3',
    name: 'IF Token',
    symbol: 'IFT',
    decimals: '8',
    initialAmount: MILLION
  },
  {
    holder: '0x34082bb749d5a09a9d81d0974d57c9052245cb70',
    name: 'BT Token',
    symbol: 'BTT',
    decimals: '8',
    initialAmount: MILLION
  },
  {
    holder: '0x0139b2e340e14c85ab1bd008a0e877592f997f0a',
    name: 'SL Token',
    symbol: 'SLT',
    decimals: '8',
    initialAmount: MILLION
  }
]

const MINTABLE_AND_BURNABLE_TOKENS = [
  {
    holder: '0xfebc7d461b970516c6d3629923c73cc6475f1d13',
    name: 'TIME',
    symbol: 'TIME',
    decimals: '8',
    initialAmount: MILLION
  },
  {
    holder: '0xc1f32aa12d34774c469731e7531fd818ce5c7f04',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    decimals: '18',
    initialAmount: MILLION
  },
  {
    holder: '0x98d4b96704a0da8be312d77d75706d52e61e6867',
    name: 'Wrapped Labour-Hour',
    symbol: 'WLHT',
    decimals: '18',
    initialAmount: MILLION
  },
  {
    holder: '0xf52765f867da3fd3bf269b98681df18f38385759',
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    decimals: '8',
    initialAmount: MILLION
  },
  {
    holder: '0xbc026daf98e8f47381d927296f7f543eab3d9138',
    name: 'Wrapped Bitcoin Cash',
    symbol: 'WBCC',
    decimals: '8',
    initialAmount: MILLION
  },
  {
    holder: '0x5c2f34cc9c60548b8b305637ec99ccd21e0907fb',
    name: 'Wrapped Litecoin',
    symbol: 'WLTC',
    decimals: '8',
    initialAmount: MILLION
  }
]

// Array here just to simplify migration code
const WRAPPED_TOKENS = [
  {
    holder: '0x29bb3fa922e0e243b99c1d0a7bc0c8ffdaebfafb',
    name: 'Internal ETH',
    symbol: 'IETH',
    decimals: '18',
    initialAmount: MILLION
  }
]

module.exports = async (deployer) => {
  deployer.then(async () => {
    const eip20Factory = await EIP20Factory.new()
    const deployedAddresses = {
      EIP20Factory: eip20Factory.address
    }

    for (let { holder, name, symbol, decimals, initialAmount } of ERC20_TOKENS) {
      console.log(holder, name, symbol, decimals, initialAmount)
      let tokenAddr = await eip20Factory.createEIP20.call(initialAmount, name, decimals, symbol)
      await eip20Factory.createEIP20(initialAmount, name, decimals, symbol)
      console.log(`[${symbol}] address is: ${tokenAddr}`)
      deployedAddresses[symbol.toUpperCase()] = tokenAddr

      const tDeployed = await EIP20.at(tokenAddr)
      await tDeployed.transfer(holder, initialAmount)
    }

    for (let { holder, name, symbol, decimals, initialAmount } of MINTABLE_AND_BURNABLE_TOKENS) {
      const token = await MintableAndBurnableToken.new(initialAmount, name, decimals, symbol)
      console.log(`[${symbol}] address is: ${token.address}`)
      deployedAddresses[symbol.toUpperCase()] = token.address
      await token.transfer(holder, initialAmount)
    }

    for (let { holder, name, symbol, decimals, initialAmount } of WRAPPED_TOKENS) {
      const token = await WrappedEtherToken.new(initialAmount, name, decimals, symbol)
      console.log(`[${symbol}] address is: ${token.address}`)
      deployedAddresses[symbol.toUpperCase()] = token.address
      await token.transfer(holder, initialAmount)
    }

    await saveDeployedAddresses(deployedAddresses)
  })
}
