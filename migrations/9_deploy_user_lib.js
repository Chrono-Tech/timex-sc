const { saveDeployedAddresses } = require('./utils')
const { oracleAddress } = require('./config')
const Storage = artifacts.require('Storage')
const StorageManager = artifacts.require('StorageManager')
const Roles2Library = artifacts.require('Roles2Library')
const UserBackendProvider = artifacts.require('UserBackendProvider')
const UserBackend = artifacts.require('UserBackend')
const UserFactory = artifacts.require('UserFactory')

module.exports = async (deployer, network, accounts) => {
  deployer.then(async () => {
    const storage = await Storage.new()
    const storageManager = await StorageManager.new()
    await storage.setManager(storageManager.address)
    const roles2Library = await Roles2Library.new(storage.address, 'Roles2Library')
    await storageManager.giveAccess(roles2Library.address, 'Roles2Library')
    await roles2Library.setRootUser(accounts[0], true)
    const userBackend = await UserBackend.new()
    const userBackendProvider = await UserBackendProvider.new(roles2Library.address)
    await userBackendProvider.setUserBackend(userBackend.address)
    const userFactory = await UserFactory.new(roles2Library.address)
    await userFactory.setUserBackendProvider(userBackendProvider.address)
    await userFactory.setOracleAddress(oracleAddress)

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
