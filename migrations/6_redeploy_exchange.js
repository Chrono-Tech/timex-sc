const TokenTransferProxy = artifacts.require('./TokenTransferProxy.sol')
const Exchange = artifacts.require('./Exchange.sol')
const { getDeployedAddress, saveDeployedAddresses } = require('./utils')

module.exports = async (deployer) => {
  deployer.then(async () => {
    const tokenTransferProxy = await TokenTransferProxy.at(await getDeployedAddress('TokenTransferProxy'))
    const exchange = await Exchange.new(await getDeployedAddress('TIME'), tokenTransferProxy.address)

    await tokenTransferProxy.addAuthorizedAddress(exchange.address)

    await saveDeployedAddresses({
      Exchange: exchange.address
    })
  })
}
