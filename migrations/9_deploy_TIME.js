const MintableAndBurnableToken = artifacts.require('./MintableAndBurnableToken.sol')
const { saveDeployedAddresses } = require('./utils')

const TIME_OWNER = '0x34082bb749d5a09a9d81d0974d57c9052245cb70'

module.exports = async (deployer) => {
  deployer.then(async () => {
    const time = await MintableAndBurnableToken.new('0', 'TIME', 18, 'TIME')
    await time.transferOwnership(TIME_OWNER)

    const deployedAddresses = {
      TIME: time.address
    }

    await saveDeployedAddresses(deployedAddresses)
  })
}
