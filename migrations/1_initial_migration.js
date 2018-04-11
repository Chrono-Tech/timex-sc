const Migrations = artifacts.require('./Migrations.sol')
const { saveDeployedAddresses } = require('./utils')

module.exports = (deployer) => {
  deployer.then(async () => {
    const migrations = await Migrations.new()
    await saveDeployedAddresses({
      Migrations: migrations.address
    })
  })
}
