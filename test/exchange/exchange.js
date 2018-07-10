// const { assertRevert } = require('../helpers/assertRevert')
const { promisify } = require('util')
const bip39 = require('bip39')
const hdKey = require('ethereumjs-wallet/hdkey')

const EIP20 = artifacts.require('EIP20')
const TokenTransferProxy = artifacts.require('./TokenTransferProxy.sol')
const FeeToken = artifacts.require('./UnlimitedAllowanceToken.sol')
const Exchange = artifacts.require('./Exchange.sol')

const { getOrderHashHex, signOrderHashAsync, isValidSignature, isValidSignatureVRS, sign, Order } = require('@laborx/exchange.core')

let FEE, TT1, TT2, TOKEN_TRANSFER_PROXY, EXCHANGE

const hdWallet = hdKey.fromMasterSeed(bip39.mnemonicToSeed('candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'))

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
    FEE = await FeeToken.new(1000000000, 'Fee Token', 18, 'FEE')
    TOKEN_TRANSFER_PROXY = await TokenTransferProxy.new()
    EXCHANGE = await Exchange.new(FEE.address, TOKEN_TRANSFER_PROXY.address)

    TT1 = await EIP20.new(10000, 'Test Token 1', 1, 'TT1', { from: accounts[0] })
    TT2 = await EIP20.new(10000, 'Test Token 2', 1, 'TT2', { from: accounts[0] })

    await TT1.transfer(accounts[1], 1000, { from: accounts[0] })
    await TT2.transfer(accounts[2], 1000, { from: accounts[0] })

    await FEE.transfer(accounts[1], 500, { from: accounts[0] })
    await FEE.transfer(accounts[2], 500, { from: accounts[0] })

    await FEE.approve(TOKEN_TRANSFER_PROXY.address, 500, { from: accounts[1] })
    await FEE.approve(TOKEN_TRANSFER_PROXY.address, 500, { from: accounts[2] })
  })

  it('balance: account[5] has the balance of 100 ETH', async () => {
    const balance = await getBalance(accounts[5])
    assert.strictEqual(balance.toString(), '100000000000000000000')
  })

  it('approvals: TT1 owner should approve 100 to exchange contract', async () => {
    await TT1.approve(EXCHANGE.address, 100, { from: accounts[1] })
    const allowance = await TT1.allowance.call(accounts[1], EXCHANGE.address)
    assert.strictEqual(allowance.toNumber(), 100)
  })

  it('approvals: TT2 owner should approve 100 to exchange contract', async () => {
    await TT2.approve(EXCHANGE.address, 100, { from: accounts[2] })
    const allowance = await TT2.allowance.call(accounts[2], EXCHANGE.address)
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
    const isValidVRSInJs = isValidSignatureVRS(hash, { ...signature }, accounts[1])

    assert(isValidVRSInJs)
    assert(isValidInJs)
    assert(isValidInContracts)
  })

  it('exchange: Exchange.address can be authorized', async () => {
    await TOKEN_TRANSFER_PROXY.addAuthorizedAddress(
      EXCHANGE.address,
      { from: accounts[0] } // only owner can call it
    )
  })

  it('exchange: accounts[1] can send tokens via TokenTransferProxy when authorized', async () => {
    await TOKEN_TRANSFER_PROXY.addAuthorizedAddress(
      accounts[1],
      { from: accounts[0] } // only owner can call it
    )

    await TT2.approve(TOKEN_TRANSFER_PROXY.address, 100, { from: accounts[2] })
    await TOKEN_TRANSFER_PROXY.transferFrom(
      TT2.address,
      accounts[2],
      accounts[1],
      42,
      { from: accounts[1] }
    )

    const balanceAfter = await TT2.balanceOf.call(accounts[2])
    assert.strictEqual(balanceAfter.toNumber(), 958)
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

    await TT1.approve(TOKEN_TRANSFER_PROXY.address, 100, { from: accounts[1] })
    await TT2.approve(TOKEN_TRANSFER_PROXY.address, 100, { from: accounts[2] })

    await TOKEN_TRANSFER_PROXY.addAuthorizedAddress(
      EXCHANGE.address,
      { from: accounts[0] } // only owner can call it
    )

    const res = await EXCHANGE.fillOrder.call(
      [ order.maker, order.taker, order.makerTokenAddress, order.takerTokenAddress, order.feeRecipient ],
      [ order.makerTokenAmount, order.takerTokenAmount, order.makerFee, order.takerFee, order.expirationUnixTimestampSec, order.salt ],
      '10',
      true,
      signature.v,
      signature.r,
      signature.s,
      { from: accounts[2] }
    )

    assert.strictEqual(res.toNumber(), 10)
  })

  it('cancelOrder successfull', async () => {
    const order = new Order({
      exchangeContractAddress: EXCHANGE.address,
      maker: accounts[1],
      taker: accounts[2],
      makerTokenAmount: '40',
      takerTokenAmount: '50',
      makerTokenAddress: TT1.address,
      takerTokenAddress: TT2.address,
      salt: '21240',
      expirationUnixTimestampSec: 1700000000,
      makerFee: '4',
      takerFee: '5',
      feeRecipient: accounts[0]
    })

    const hash = getOrderHashHex(order)

    const unavailableBeforeCancel = await EXCHANGE.getUnavailableTakerTokenAmount.call(hash)
    assert.strictEqual(unavailableBeforeCancel.toNumber(), 0, 'Should be 0 unavailable before cancel')

    const callCancellAmountResult = await EXCHANGE.cancelOrder.call(
      [ order.maker, order.taker, order.makerTokenAddress, order.takerTokenAddress, order.feeRecipient ],
      [ order.makerTokenAmount, order.takerTokenAmount, order.makerFee, order.takerFee, order.expirationUnixTimestampSec, order.salt ],
      '10',
      { from: accounts[1] })

    assert.strictEqual(callCancellAmountResult.toNumber(), 10, 'Call cancelOrder shoult return 10')

    await EXCHANGE.cancelOrder(
      [ order.maker, order.taker, order.makerTokenAddress, order.takerTokenAddress, order.feeRecipient ],
      [ order.makerTokenAmount, order.takerTokenAmount, order.makerFee, order.takerFee, order.expirationUnixTimestampSec, order.salt ],
      '10',
      { from: accounts[1] })

    const unavailableAfterCancel = await EXCHANGE.getUnavailableTakerTokenAmount.call(hash)
    assert.strictEqual(unavailableAfterCancel.toNumber(), 10, 'Should be 10 unavailable after cancel')
  })

  it('fillOrdersUpTo successfull', async () => {
    const { order: order1, signature: signature1 } = await createOrderAndSignature({
      makerTokenAmount: '10',
      takerTokenAmount: '20',
      privateKey: privateKeys[1]
    })

    const { order: order2, signature: signature2 } = await createOrderAndSignature({
      makerTokenAmount: '30',
      takerTokenAmount: '60',
      privateKey: privateKeys[1]
    })

    await TT1.approve(TOKEN_TRANSFER_PROXY.address, 100, { from: accounts[1] })
    await TT2.approve(TOKEN_TRANSFER_PROXY.address, 100, { from: accounts[2] })

    await TOKEN_TRANSFER_PROXY.addAuthorizedAddress(
      EXCHANGE.address,
      { from: accounts[0] } // only owner can call it
    )

    const { orderAddresses, orderValues, v, r, s } = ordersToFillOrdersUpToArguments([
      { order: order1, signature: signature1 },
      { order: order2, signature: signature2 }
    ])

    await EXCHANGE.fillOrdersUpTo(
      orderAddresses,
      orderValues,
      '50',
      true,
      v,
      r,
      s,
      { from: accounts[2] })

    const unavailableOrder1Amount = await EXCHANGE.getUnavailableTakerTokenAmount.call(getOrderHashHex(order1))
    assert.strictEqual(unavailableOrder1Amount.toNumber(), 20, 'Order 1 must have 20 unavailable')

    const unavailableOrder2Amount = await EXCHANGE.getUnavailableTakerTokenAmount.call(getOrderHashHex(order2))
    assert.strictEqual(unavailableOrder2Amount.toNumber(), 30, 'Order 2 must have 30 unavailable')

    function ordersToFillOrdersUpToArguments (orderAndSignatures) {
      const orderAddresses = []
      const orderValues = []
      const v = []
      const r = []
      const s = []
      for (let i = 0; i < orderAndSignatures.length; ++i) {
        const { order, signature } = orderAndSignatures[i]
        orderAddresses.push([ order.maker, order.taker, order.makerTokenAddress, order.takerTokenAddress, order.feeRecipient ])
        orderValues.push([ order.makerTokenAmount, order.takerTokenAmount, order.makerFee, order.takerFee, order.expirationUnixTimestampSec, order.salt ])
        v.push(signature.v)
        r.push(signature.r)
        s.push(signature.s)
      }
      return {
        orderAddresses,
        orderValues,
        v,
        r,
        s
      }
    }

    async function createOrderAndSignature ({ makerTokenAmount, takerTokenAmount, privateKey }) {
      const order = new Order({
        exchangeContractAddress: EXCHANGE.address,
        maker: accounts[1],
        taker: accounts[2],
        makerTokenAmount,
        takerTokenAmount,
        makerTokenAddress: TT1.address,
        takerTokenAddress: TT2.address,
        salt: '21240',
        expirationUnixTimestampSec: 1600000000,
        makerFee: '0',
        takerFee: '0',
        feeRecipient: accounts[0]
      })

      const hash = getOrderHashHex(order)
      const signer = {
        async sign (data) {
          return sign(data, `0x${privateKey}`)
        }
      }
      const signature = await signOrderHashAsync(hash, accounts[1], false, signer)

      return {
        order,
        signature
      }
    }
  })
})
