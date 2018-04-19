if (process.argv.length < 3) {
  console.error('[Error] Provide mnemonic as a program argument')
  process.exit(1)
}

const mnemonic = process.argv[2]

const bip39 = require('bip39')
const hdKey = require('ethereumjs-wallet/hdkey')

const hdWallet = hdKey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic))

const derivedWallets = Array
  .from({ length: 10 })
  .map((item, index) => hdWallet.derivePath(`m/44'/60'/0'/0/${index}`).getWallet())

console.log(mnemonic)
console.log('---------------------')
for (const wallet of derivedWallets) {
  console.log(`0x${wallet.getAddress().toString('hex')}: ${wallet.getPrivateKey().toString('hex')}`)
}
