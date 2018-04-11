const EIP20Factory = artifacts.require('./EIP20Factory.sol')
const EIP20 = artifacts.require('./EIP20.sol')
const WETH9 = artifacts.require('./WETH9.sol')
const { saveDeployedAddresses } = require('./utils')

const MILLION = '1000000000000000000000000'
const ERC20_TOKEN_DESCRIPTION = [
  {
    holder: '0x1134cc86b45039cc211c6d1d2e4b3c77f60207ed',
    name: 'Igor Pavlenko',
    symbol: 'IPT',
    decimals: '18',
    initialAmount: MILLION
  },
  {
    holder: '0x623ec1e5096d5a682967e7994401173845763b44',
    name: 'Mikhail Kardaev',
    symbol: 'MKT',
    decimals: '18',
    initialAmount: MILLION
  },
  {
    holder: '0x90892995479b0b96cea0bc332620d7464e0e6692',
    name: 'Anna Karpova',
    symbol: 'AKT',
    decimals: '18',
    initialAmount: MILLION
  },
  {
    holder: '0x0bab5d88475978a4eaa6001bd8e7c1350afb3485',
    name: 'Roman Loktev',
    symbol: 'RLT',
    decimals: '18',
    initialAmount: MILLION
  }
]

module.exports = async (deployer) => {
  deployer.then(async () => {
    const factory = await EIP20Factory.deployed()

    const deployedAddresses = {}
    for (let { holder, name, symbol, decimals, initialAmount } of ERC20_TOKEN_DESCRIPTION) {
      const tokenAddr = await factory.createEIP20.call(initialAmount, name, decimals, symbol)
      await factory.createEIP20(initialAmount, name, decimals, symbol)
      console.log(`[${symbol}] address is: ${tokenAddr}`)
      deployedAddresses[symbol.toUpperCase()] = tokenAddr

      const tDeployed = await EIP20.at(tokenAddr)
      await tDeployed.transfer(holder, initialAmount)
    }

    await deployer.deploy(WETH9)
    deployedAddresses['WETH'] = WETH9.address

    await saveDeployedAddresses(deployedAddresses)
  })
}
