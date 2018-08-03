const TokenTransferProxy = artifacts.require('./TokenTransferProxy.sol')
const Exchange = artifacts.require('./Exchange.sol')
const RewardService = artifacts.require('./RewardService.sol')
const { getDeployedAddress, saveDeployedAddresses } = require('./utils')

module.exports = async (deployer) => {
  deployer.then(async () => {
    const timeTokenAddress = await getDeployedAddress('TIME')
    const userRegistryAddress = await getDeployedAddress('UserRegistry')

    const tokenTransferProxy = await TokenTransferProxy.new()
    console.log(`[TokenTransferProxy] address is: ${tokenTransferProxy.address}`)

    const rewardService = await RewardService.new(timeTokenAddress, '1', '3')
    console.log(`[RewardService] address is: ${rewardService.address}`)

    const exchange = await Exchange.new(
      timeTokenAddress,
      tokenTransferProxy.address,
      userRegistryAddress,
      rewardService.address)
    console.log(`[Exchange] address is: ${exchange.address}`)

    await tokenTransferProxy.addAuthorizedAddress(exchange.address)

    await saveDeployedAddresses({
      TokenTransferProxy: tokenTransferProxy.address,
      Exchange: exchange.address,
      RewardService: rewardService.address
    })
  })
}
