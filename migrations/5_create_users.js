const { saveDeployedAddresses, getDeployedAddress } = require('./utils')
const UserFactory = artifacts.require('UserFactory.sol')
const Recovery = artifacts.require('Recovery.sol')

const ACCOUNT_RLT = '0x0bab5d88475978a4eaa6001bd8e7c1350afb3485'

module.exports = async (deployer, network, accounts) => {
  deployer.then(async () => {
    const userFactory = UserFactory.at(
      await getDeployedAddress('UserFactory')
    )
    const recovery = Recovery.at(
      await getDeployedAddress('Recovery')
    )
    console.log('userFactory.address', userFactory.address)
    console.log('recovery.address', recovery.address)
    await userFactory.createUserWithProxyAndRecovery(ACCOUNT_RLT, recovery.address, false)
    await saveDeployedAddresses({
      Recovery: recovery.address
    })
  })
}
