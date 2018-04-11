const assert = require('assert')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const DEPLOYED_ADDRESSES_PATH = path.join(__dirname, '..', 'deployed-addresses.json')

async function saveDeployedAddresses (addresses) {
  assert(addresses, 'Addresses must be not empty object')

  const json = JSON.parse(await promisify(fs.readFile)(DEPLOYED_ADDRESSES_PATH))
  await promisify(fs.writeFile)(DEPLOYED_ADDRESSES_PATH, JSON.stringify({
    ...json,
    ...addresses
  }, null, 2))
}
module.exports = {
  saveDeployedAddresses
}
