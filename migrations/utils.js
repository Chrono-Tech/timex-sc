const assert = require('assert')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const DEPLOYED_ADDRESSES_PATH = path.join(__dirname, '..', 'deployed-addresses.json')

async function saveDeployedAddresses (addresses) {
  assert(addresses, 'Addresses must be not empty object')

  const json = await readDeployedJson()

  await promisify(fs.writeFile)(DEPLOYED_ADDRESSES_PATH, JSON.stringify({
    ...json,
    ...addresses
  }, null, 2) + '\n')
}

async function getDeployedAddress (contractName) {
  const json = await readDeployedJson()
  return json[contractName]
}

async function readDeployedJson () {
  let json = {}
  if (fs.existsSync(DEPLOYED_ADDRESSES_PATH)) {
    try {
      json = JSON.parse(await promisify(fs.readFile)(DEPLOYED_ADDRESSES_PATH))
    } catch (e) {
      // nothiheng
    }
  }
  return json
}

module.exports = {
  saveDeployedAddresses,
  getDeployedAddress
}
