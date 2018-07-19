pragma solidity 0.4.21;

import "../exchange/TokenTransferProxy.sol";
import "../utils/SafeMathLibrary.sol";

contract RewardService is TokenTransferProxy {

  using SafeMathLibrary for uint;

  address public token;
  uint public rateDivider;
  uint public rateMultiplier;

  mapping (address => uint) public balances;

  event Deposit(address to, uint256 value);
  event Withdraw(address from, address to, uint256 value);

  function RewardService(address _token, uint _rateMultiplier, uint _rateDivider) public {
    token = _token;
    rateMultiplier = _rateMultiplier;
    rateDivider = _rateDivider;
  }

  function balanceOf(address _owner) public view returns (uint balance) {
      return balances[_owner];
  }

  function deposit(address _to, uint _value) public onlyAuthorized returns (bool success) {
    uint amount = _value.safeMul(rateMultiplier).safeDiv(rateDivider);
    balances[_to] = balances[_to].safeAdd(amount);
    emit Deposit(_to, amount);
    return true;
  }

  function reward(address _to, uint _value) public returns (bool success) {
    require(balances[msg.sender] >= _value);
    balances[msg.sender] -= _value;

    Token(token).transfer(_to, _value);

    emit Withdraw(msg.sender, _to, _value);
    return true;
  }
}
