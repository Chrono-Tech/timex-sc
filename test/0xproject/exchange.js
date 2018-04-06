// const { assertRevert } = require('../helpers/assertRevert')

const EIP20 = artifacts.require('EIP20')
const TokenTransferProxy = artifacts.require('./TokenTransferProxy.sol')
const ZRXToken = artifacts.require('./ZRXToken.sol')
const Exchange = artifacts.require('./Exchange.sol')

let ZRX, TT1, TT2, TOKEN_TRANSFER_PROXY, EXCHANGE

contract('Exchange', (accounts) => {
  beforeEach(async () => {
    ZRX = await ZRXToken.new()
    TOKEN_TRANSFER_PROXY = await TokenTransferProxy.new()
    EXCHANGE = await Exchange.new(ZRX.address, TOKEN_TRANSFER_PROXY.address)

    TT1 = await EIP20.new(10000, 'Test Token 1', 1, 'TT1', { from: accounts[0] })
    TT2 = await EIP20.new(10000, 'Test Token 2', 1, 'TT2', { from: accounts[0] })

    await TT1.transfer(accounts[1], 1000, { from: accounts[0] })
    await TT1.transfer(accounts[2], 1000, { from: accounts[0] })
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

  it('exchange: msg.sender should getOrderHash', async () => {
    const hash = await EXCHANGE.getOrderHash.call(
      [
        accounts[1], // maker
        accounts[2], // taker
        TT1.address, // makerToken
        TT2.address, // takerToken
        accounts[0] // feeRecipient
      ],
      [
        40, // makerAmount
        50, // takerAmount
        4, // makerFee
        5, // takerFee
        1600000000, // expirationTimestampInSec
        21240 // salt
      ]
    )
    assert.strictEqual(hash, '0xb495674eb3298eaaa5daccff0e20d56d4774f2bd3d2ea0d747cad52fa2776c45')
  })

  // it('exchange: msg.sender should getOrderHash', async () => {
  //   const hash = await EXCHANGE.getOrderHash.call(
  //     [
  //       accounts[1], // maker
  //       accounts[2], // taker
  //       TT1.address, // makerToken
  //       TT2.address, // takerToken
  //       accounts[0] // feeRecipient
  //     ],
  //     [
  //       40, // makerAmount
  //       50, // takerAmount
  //       4, // makerFee
  //       5, // takerFee
  //       1600000000, // expirationTimestampInSec
  //       21240 // salt
  //     ]
  //   )
  //
  //   const hash = await EXCHANGE.isValidSignature.call(
  //     accounts[1],
  //     hash,
  //     v,
  //     r,
  //     s
  //   )
  //   assert.strictEqual(hash, '0xb495674eb3298eaaa5daccff0e20d56d4774f2bd3d2ea0d747cad52fa2776c45')
  // })
})
