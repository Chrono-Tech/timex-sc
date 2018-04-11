const EIP20Factory = artifacts.require('./EIP20Factory.sol')
const TokenTransferProxy = artifacts.require('./TokenTransferProxy.sol')
const ZRXToken = artifacts.require('./ZRXToken.sol')
const Exchange = artifacts.require('./Exchange.sol')
const { saveDeployedAddresses } = require('./utils')

module.exports = async (deployer) => {
  deployer.then(async () => {
    await deployer.deploy(ZRXToken)
    await deployer.deploy(TokenTransferProxy)
    await deployer.deploy(Exchange, ZRXToken.address, TokenTransferProxy.address)

    const ttpDeployed = await TokenTransferProxy.deployed()
    await ttpDeployed.addAuthorizedAddress(Exchange.address)

    await deployer.deploy(EIP20Factory)

    await saveDeployedAddresses({
      ZRXT: ZRXToken.address,
      TokenTransferProxy: TokenTransferProxy.address,
      Exchange: Exchange.address,
      EIP20Factory: EIP20Factory.address
    })
  })
}
