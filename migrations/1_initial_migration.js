const Migrations = artifacts.require('./Migrations.sol')
const { saveDeployedAddresses } = require('./utils')

module.exports = (deployer) => {
  deployer.then(async () => {
    await deployer.deploy(Migrations)
    await saveDeployedAddresses({
      Migrations: Migrations.address
    })
  })
}
