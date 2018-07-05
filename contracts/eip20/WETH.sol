pragma solidity ^0.4.18;


import "./MintableAndBurnableToken.sol";

contract WETH is MintableAndBurnableToken {
  event  Deposit(address indexed dst, uint wad);
  event  Withdrawal(address indexed src, uint wad);

  function WETH()
    MintableAndBurnableToken(0, 'Wrapped Ether', 18, 'WETH') { }

  function() public payable {
      deposit();
  }

  function deposit() public payable {
      balances[msg.sender] += msg.value;
      totalSupply += msg.value;
      emit Deposit(msg.sender, msg.value);
  }

  function withdraw(uint wad) public {
      require(balanceOf(msg.sender) >= wad);
      balances[msg.sender] -= wad;
      totalSupply -= wad;
      msg.sender.transfer(wad);
      emit Withdrawal(msg.sender, wad);
  }
}
