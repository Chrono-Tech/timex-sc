const RewardService = artifacts.require('./RewardService.sol')
const Exchange = artifacts.require('./Exchange.sol')
const { saveDeployedAddresses, getDeployedAddress } = require('./utils')

module.exports = async (deployer) => {
  deployer.then(async () => {
    const rewardService = await RewardService.new(await getDeployedAddress('TIME'), '1', '3')
    const exchange = Exchange.at(await getDeployedAddress('Exchange'))

    await exchange.setRewardContract(rewardService.address)

    await rewardService.addAuthorizedAddress(exchange.address)

    await saveDeployedAddresses({
      rewardService: rewardService.address
    })
  })
}
