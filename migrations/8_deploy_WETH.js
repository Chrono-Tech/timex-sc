const WETH = artifacts.require('./WETH.sol')
const { saveDeployedAddresses } = require('./utils')

const WETH_OWNER = '0x0139b2e340e14c85ab1bd008a0e877592f997f0a'

module.exports = async (deployer) => {
  deployer.then(async () => {
    const weth = await WETH.new()
    await weth.transferOwnership(WETH_OWNER)

    const deployedAddresses = {
      WETH: weth.address
    }

    await saveDeployedAddresses(deployedAddresses)
  })
}
