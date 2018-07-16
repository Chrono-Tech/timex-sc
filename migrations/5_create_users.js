const { getDeployedAddress } = require('./utils')
const UserFactory = artifacts.require('UserFactory.sol')

const ACCOUNT_RLT = '0x0bab5d88475978a4eaa6001bd8e7c1350afb3485'

module.exports = async (deployer, network, accounts) => {
  deployer.then(async () => {
    const userFactory = UserFactory.at(
      await getDeployedAddress('UserFactory')
    )
    await userFactory.createUserWithProxyAndRecovery(ACCOUNT_RLT, false)
    console.log('User created')
  })
}
