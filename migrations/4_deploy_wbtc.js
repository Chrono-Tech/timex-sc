const MintableAndBurnableToken = artifacts.require('./MintableAndBurnableToken.sol')
const { saveDeployedAddresses } = require('./utils')

const WBTC_OWNER = '0x3c1492ac96ada525e882d560efd47d0d590ce6a7'

module.exports = async (deployer) => {
  deployer.then(async () => {
    const wbtc = await MintableAndBurnableToken.new('0', 'Wrapped BTC', 8, 'WBTC')
    await wbtc.transferOwnership(WBTC_OWNER)

    const deployedAddresses = {
      WBTC: wbtc.address
    }

    await saveDeployedAddresses(deployedAddresses)
  })
}
