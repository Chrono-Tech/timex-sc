// const { assertRevert } = require('../helpers/assertRevert')

const EIP20 = artifacts.require('EIP20')
const TokenTransferProxy = artifacts.require('./TokenTransferProxy.sol')
const ZRXToken = artifacts.require('./ZRXToken.sol')
const Exchange = artifacts.require('./Exchange.sol')

const { getOrderHashHex, signOrderHashAsync, isValidSignature, sign, Order } = require('@laborx/exchange.core')

let ZRX, TT1, TT2, TOKEN_TRANSFER_PROXY, EXCHANGE

const privateKeys = [
  'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
  'ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f',
  '0dbbe8e4ae425a6d2687f1a7e3ba17bc98c673636790f1b8ad91193c05875ef1',
  'c88b703fb08cbea894b6aeff5a544fb92e78a18e19814cd85da83b71f772aa6c',
  '388c684f0ba1ef5017716adb5d21a053ea8e90277d0868337519f97bede61418',
  '659cbb0e2411a44db63778987b1e22153c086a95eb6b18bdf89de078917abc63',
  '82d052c865f5763aad42add438569276c00d3d88a2d062d36b2bae914d58b8c8',
  'aa3680d5d48a8283413f7a108367c7299ca73f553735860a87b08f39395618b7',
  '0f62d96d6675f32685bbdb8ac13cda7c23436f63efbb9d07700d8669ff12b7c4',
  '8d5366123cb560bb606379f90a0bfd4769eecc0557f1b362dcae9012b548b1e5'
]

contract('Exchange', (accounts, d) => {
  beforeEach(async () => {
    ZRX = await ZRXToken.new()
    TOKEN_TRANSFER_PROXY = await TokenTransferProxy.new()
    EXCHANGE = await Exchange.new(ZRX.address, TOKEN_TRANSFER_PROXY.address)

    TT1 = await EIP20.new(10000, 'Test Token 1', 1, 'TT1', { from: accounts[0] })
    TT2 = await EIP20.new(10000, 'Test Token 2', 1, 'TT2', { from: accounts[0] })

    await TT1.transfer(accounts[1], 1000, { from: accounts[0] })
    await TT2.transfer(accounts[2], 1000, { from: accounts[0] })
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

    assert(isValidInContracts)

    const isValidInJs = isValidSignature(hash, signature.signature, accounts[1])
    assert(isValidInJs)
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
    // await TT1.allowance.call(accounts[1], Exchange.address)
    // assert.strictEqual(allowance.toNumber(), 100)

    await TT2.approve(Exchange.address, 100, { from: accounts[2] })
    // await TT2.allowance.call(accounts[2], Exchange.address)
    // assert.strictEqual(allowance.toNumber(), 100)

    try {
      const res = await EXCHANGE.fillOrder(
        [ order.maker, order.taker, order.makerTokenAddress, order.takerTokenAddress, order.feeRecipient ],
        [ order.makerTokenAmount, order.takerTokenAmount, order.makerFee, order.takerFee, order.expirationUnixTimestampSec, order.salt ],
        '4',
        true,
        signature.v,
        signature.r,
        signature.s,
        { from: accounts[2] }
      )

      console.log('filledTakerTokenAmount', res, res.logs[0].args)
      // assert(isValidInContracts)
    } catch (e) {
      console.log(e)
      throw e
    }
  })
})
