const RewardService = artifacts.require('./RewardService.sol')
const { getDeployedAddress } = require('./utils')

module.exports = async (deployer) => {
  deployer.then(async () => {
    const rewardService = await RewardService.at(await getDeployedAddress('RewardService'))
    const exchangeAddress = await getDeployedAddress('Exchange')

    await rewardService.addAuthorizedAddress(exchangeAddress)
  })
}
