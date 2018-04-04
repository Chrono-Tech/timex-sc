const EIP20 = artifacts.require('./EIP20.sol')

module.exports = async (deployer) => {
  deployer.then(async () => {
    await deployer.deploy(EIP20, 10000, 'Simon Bucks', 1, 'SBX')
    await deployer.deploy(EIP20, 10000, 'Igor Pavlenko', 1, 'IPT')
    await deployer.deploy(EIP20, 10000, 'Mikhail Kardaev', 1, 'MKT')
    await deployer.deploy(EIP20, 10000, 'Artem Valyakin', 1, 'AVT')
    await deployer.deploy(EIP20, 10000, 'Roman Loktev', 1, 'RLT')
  })
}
