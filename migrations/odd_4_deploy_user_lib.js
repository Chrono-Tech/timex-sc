const { saveDeployedAddresses } = require('./utils')
const Storage = artifacts.require('Storage.sol')
const AppStorageManager = artifacts.require('AppStorageManager.sol')
const Roles2Library = artifacts.require('Roles2Library.sol')
const UserBackendProvider = artifacts.require('UserBackendProvider.sol')
const UserBackend = artifacts.require('UserBackend.sol')
const UserFactory = artifacts.require('UserFactory.sol')

const ORACLE_ADDRESS = '0xc291ebf9de0bba851f47318ee18ba7a1c71baa29'

module.exports = async (deployer, network, accounts) => {
  deployer.then(async () => {
    const storage = await Storage.new()
    console.log(`[Storage] address is: ${storage.address}`)
    const storageManager = await AppStorageManager.new()
    console.log(`[StorageManager] address is: ${storageManager.address}`)
    await storage.setManager(storageManager.address)
    const roles2Library = await Roles2Library.new(storage.address, 'Roles2Library')
    console.log(`[Roles2Library] address is: ${roles2Library.address}`)
    await storageManager.giveAccess(roles2Library.address, 'Roles2Library')
    await roles2Library.setRootUser(accounts[0], true)
    const userBackend = await UserBackend.new()
    console.log(`[UserBackend] address is: ${userBackend.address}`)
    const userBackendProvider = await UserBackendProvider.new(roles2Library.address)
    console.log(`[UserBackendProvider] address is: ${userBackendProvider.address}`)
    await userBackendProvider.setUserBackend(userBackend.address)
    const userFactory = await UserFactory.new(roles2Library.address)
    console.log(`[UserFactory] address is: ${userFactory.address}`)
    await userFactory.setUserBackendProvider(userBackendProvider.address)
    await userFactory.setOracleAddress(ORACLE_ADDRESS)

    await saveDeployedAddresses({
      Storage: storage.address,
      StorageManager: storageManager.address,
      Roles2Library: roles2Library.address,
      UserBackend: userBackend.address,
      UserBackendProvider: userBackendProvider.address,
      UserFactory: userFactory.address
    })
  })
}
