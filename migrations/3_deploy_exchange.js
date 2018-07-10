const TokenTransferProxy = artifacts.require('./TokenTransferProxy.sol')
const Exchange = artifacts.require('./Exchange.sol')
const { getDeployedAddress, saveDeployedAddresses } = require('./utils')

module.exports = async (deployer) => {
  deployer.then(async () => {
    const timeTokenAddress = await getDeployedAddress('TIME')
    const tokenTransferProxy = await TokenTransferProxy.new()
    console.log(`[TokenTransferProxy] address is: ${tokenTransferProxy.address}`)
    const exchange = await Exchange.new(timeTokenAddress, tokenTransferProxy.address)
    console.log(`[Exchange] address is: ${exchange.address}`)

    await tokenTransferProxy.addAuthorizedAddress(exchange.address)

    await saveDeployedAddresses({
      TokenTransferProxy: tokenTransferProxy.address,
      Exchange: exchange.address
    })
  })
}
