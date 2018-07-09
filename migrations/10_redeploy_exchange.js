const Exchange = artifacts.require('./Exchange.sol')
const TokenTransferProxy = artifacts.require('./TokenTransferProxy.sol')
const MintableAndBurnableToken = artifacts.require('./MintableAndBurnableToken.sol')
const { saveDeployedAddresses, getDeployedAddress } = require('./utils')

module.exports = async (deployer) => {
  deployer.then(async () => {
    const time = await MintableAndBurnableToken.at(await getDeployedAddress('TIME'))
    const tokenTransferProxy = await TokenTransferProxy.at(await getDeployedAddress('TokenTransferProxy'))

    const exchange = await Exchange.new(time.address, tokenTransferProxy.address)

    await tokenTransferProxy.addAuthorizedAddress(exchange.address)

    await saveDeployedAddresses({
      Exchange: exchange.address
    })
  })
}
