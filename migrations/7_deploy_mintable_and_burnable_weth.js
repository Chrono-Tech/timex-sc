const MintableAndBurnableToken = artifacts.require('./MintableAndBurnableToken.sol')
const { saveDeployedAddresses } = require('./utils')

const WETH_OWNER = '0x1c4b3995d463d15aeca5728b55062e40f913a968'

module.exports = async (deployer) => {
  deployer.then(async () => {
    const weth = await MintableAndBurnableToken.new('0', 'Wrapped Ether', 18, 'WETH')
    await weth.transferOwnership(WETH_OWNER)

    const deployedAddresses = {
      M_WETH: weth.address
    }

    await saveDeployedAddresses(deployedAddresses)
  })
}
