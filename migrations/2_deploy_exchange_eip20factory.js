const EIP20Factory = artifacts.require('./EIP20Factory.sol')
const TokenTransferProxy = artifacts.require('./TokenTransferProxy.sol')
const ZRXToken = artifacts.require('./ZRXToken.sol')
const Exchange = artifacts.require('./Exchange.sol')
const { saveDeployedAddresses } = require('./utils')

module.exports = async (deployer) => {
  deployer.then(async () => {
    const zrxToken = await ZRXToken.new()
    const tokenTransferProxy = await TokenTransferProxy.new()
    const exchange = await Exchange.new(zrxToken.address, tokenTransferProxy.address)

    await tokenTransferProxy.addAuthorizedAddress(exchange.address)

    const eip20Factory = await EIP20Factory.new()

    await saveDeployedAddresses({
      ZRXT: zrxToken.address,
      TokenTransferProxy: tokenTransferProxy.address,
      Exchange: exchange.address,
      EIP20Factory: eip20Factory.address
    })
  })
}
