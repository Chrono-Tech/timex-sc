// const { assertRevert } = require('../helpers/assertRevert')
const { promisify } = require('util')
const bip39 = require('bip39')
const hdKey = require('ethereumjs-wallet/hdkey')
const secrets = require('../../secrets.json')

const EIP20 = artifacts.require('EIP20')
const TokenTransferProxy = artifacts.require('./TokenTransferProxy.sol')
const ZRXToken = artifacts.require('./ZRXToken.sol')
const Exchange = artifacts.require('./Exchange.sol')

const { getOrderHashHex, signOrderHashAsync, isValidSignature, sign, Order } = require('@laborx/exchange.core')

let ZRX, TT1, TT2, TOKEN_TRANSFER_PROXY, EXCHANGE

const hdWallet = hdKey.fromMasterSeed(bip39.mnemonicToSeed(secrets.mnemonic))

const derivedWallets = Array
  .from({ length: 10 })
  .map((item, index) => hdWallet.derivePath(`m/44'/60'/0'/0/${index}`).getWallet())

const privateKeys = derivedWallets.map(wallet => wallet.getPrivateKey().toString('hex'))

const getBalance = promisify((account, cb) => web3.eth.getBalance(account, cb))

contract('Exchange', (accounts, d) => {
  console.log('Accounts:')
  console.log(accounts)
  console.log('Private Keys:')
  console.log(privateKeys)

  beforeEach(async () => {
    ZRX = await ZRXToken.new()
    TOKEN_TRANSFER_PROXY = await TokenTransferProxy.new()
    EXCHANGE = await Exchange.new(ZRX.address, TOKEN_TRANSFER_PROXY.address)

    TT1 = await EIP20.new(10000, 'Test Token 1', 1, 'TT1', { from: accounts[0] })
    TT2 = await EIP20.new(10000, 'Test Token 2', 1, 'TT2', { from: accounts[0] })

    await TT1.transfer(accounts[1], 1000, { from: accounts[0] })
    await TT2.transfer(accounts[2], 1000, { from: accounts[0] })
  })

  it('balance: account[5] has the balance of 100 ETH', async () => {
    const balance = await getBalance(accounts[5])
    assert.strictEqual(balance.toString(), '100000000000000000000')
  })

  it('approvals: TT1 owner should approve 100 to exchange contract', async () => {
    await TT1.approve(Exchange.address, 100, { from: accounts[1] })
    const allowance = await TT1.allowance.call(accounts[1], Exchange.address)
    assert.strictEqual(allowance.toNumber(), 100)
  })

  it('approvals: TT2 owner should approve 100 to exchange contract', async () => {
    await TT2.approve(Exchange.address, 100, { from: accounts[2] })
    const allowance = await TT2.allowance.call(accounts[2], Exchange.address)
    assert.strictEqual(allowance.toNumber(), 100)
  })

  it('exchange: msg.sender should getOrderHash from contracts', async () => {
    const order = new Order({
      exchangeContractAddress: EXCHANGE.address,
      maker: accounts[1],
      taker: accounts[2],
      makerTokenAmount: '40',
      takerTokenAmount: '50',
      makerTokenAddress: TT1.address,
      takerTokenAddress: TT2.address,
      salt: '21240',
      expirationUnixTimestampSec: 1600000000,
      makerFee: '4',
      takerFee: '5',
      feeRecipient: accounts[0]
    })

    const hashFromJs = getOrderHashHex(order)

    const hashFromContracts = await EXCHANGE.getOrderHash.call(
      [ order.maker, order.taker, order.makerTokenAddress, order.takerTokenAddress, order.feeRecipient ],
      [ order.makerTokenAmount, order.takerTokenAmount, order.makerFee, order.takerFee, order.expirationUnixTimestampSec, order.salt ]
    )

    assert.strictEqual(hashFromContracts, hashFromJs)
  })

  it('exchange: msg.sender should check order signature with isValidSignature', async () => {
    const order = new Order({
      exchangeContractAddress: EXCHANGE.address,
      maker: accounts[1],
      taker: accounts[2],
      makerTokenAmount: '40',
      takerTokenAmount: '50',
      makerTokenAddress: TT1.address,
      takerTokenAddress: TT2.address,
      salt: '21240',
      expirationUnixTimestampSec: 1600000000,
      makerFee: '4',
      takerFee: '5',
      feeRecipient: accounts[0]
    })

    const hash = getOrderHashHex(order)
    const signer = {
      async sign (data) {
        return sign(data, `0x${privateKeys[1]}`)
      }
    }
    const signature = await signOrderHashAsync(hash, accounts[1], false, signer)
    const isValidInContracts = await EXCHANGE.isValidSignature.call(
      order.maker, // signer
      hash,
      signature.v,
      signature.r,
      signature.s
    )

    const isValidInJs = isValidSignature(hash, signature.signature, accounts[1])
    assert(isValidInJs && isValidInContracts)
  })

  it('exchange: msg.sender should fillOrder', async () => {
    const order = new Order({
      exchangeContractAddress: EXCHANGE.address,
      maker: accounts[1],
      taker: accounts[2],
      makerTokenAmount: '40',
      takerTokenAmount: '50',
      makerTokenAddress: TT1.address,
      takerTokenAddress: TT2.address,
      salt: '21240',
      expirationUnixTimestampSec: 1600000000,
      makerFee: '4',
      takerFee: '5',
      feeRecipient: accounts[0]
    })

    const hash = getOrderHashHex(order)
    const signer = {
      async sign (data) {
        return sign(data, `0x${privateKeys[1]}`)
      }
    }
    const signature = await signOrderHashAsync(hash, accounts[1], false, signer)

    await TT1.approve(Exchange.address, 100, { from: accounts[1] })
    await TT2.approve(Exchange.address, 100, { from: accounts[2] })

    await EXCHANGE.fillOrder(
      [ order.maker, order.taker, order.makerTokenAddress, order.takerTokenAddress, order.feeRecipient ],
      [ order.makerTokenAmount, order.takerTokenAmount, order.makerFee, order.takerFee, order.expirationUnixTimestampSec, order.salt ],
      '4',
      true,
      signature.v,
      signature.r,
      signature.s,
      { from: accounts[2] }
    )
  })
})
