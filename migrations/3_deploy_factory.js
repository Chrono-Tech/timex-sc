const EIP20Factory =
  artifacts.require('./EIP20Factory.sol')

module.exports = (deployer) => {
  deployer.then(async () => {
    await deployer.deploy(EIP20Factory)
  })
}
