const TokenTransferProxy = artifacts.require('./TokenTransferProxy.sol')
const ZRXToken = artifacts.require('./ZRXToken.sol')
const Exchange = artifacts.require('./Exchange.sol')

module.exports = (deployer) => {
  deployer.then(async () => {
    await deployer.deploy(ZRXToken)
    await deployer.deploy(TokenTransferProxy)
    await deployer.deploy(Exchange, ZRXToken.address, TokenTransferProxy.address)
  })
}
