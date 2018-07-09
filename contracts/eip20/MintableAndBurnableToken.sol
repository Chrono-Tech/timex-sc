pragma solidity ^0.4.11;

import "./EIP20.sol";

contract MintableAndBurnableToken is EIP20 {
  constructor(
      uint256 _initialAmount,
      string _tokenName,
      uint8 _decimalUnits,
      string _tokenSymbol
  ) EIP20(
    _initialAmount,
    _tokenName,
    _decimalUnits,
    _tokenSymbol
  ) public {
  }

  event Burn(address indexed from, uint256 value);
  event WithdrawBurn(address indexed from, uint256 value, string externalAddress);

  event Mint(address indexed to, uint256 amount);

  /**
  * @dev Burns a specific amount of tokens.
  * @param _value The amount of token to be burned.
  */
  function burn(address _who, uint256 _value) onlyOwner public {
    require(_value <= balances[_who]);
    // no need to require value <= totalSupply, since that would imply the
    // sender's balance is greater than the totalSupply, which *should* be an assertion failure

    balances[_who] = balances[_who].sub(_value);
    totalSupply = totalSupply.sub(_value);
    emit Burn(_who, _value);
    emit Transfer(_who, address(0), _value);
  }

  /**
  * @dev Burns a specific amount of tokens for withdraw
  */
  function withdrawBurn(uint256 _value, string externalAddress) public {
    address _who = msg.sender;
    require(_value <= balances[_who]);
    // no need to require value <= totalSupply, since that would imply the
    // sender's balance is greater than the totalSupply, which *should* be an assertion failure

    balances[_who] = balances[_who].sub(_value);
    totalSupply = totalSupply.sub(_value);
    emit Burn(_who, _value);
    emit WithdrawBurn(_who, _value, externalAddress);
    emit Transfer(_who, address(0), _value);
  }


  /**
   * @dev Function to mint tokens
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint (address _to, uint256 _amount) public onlyOwner returns (bool)
  {
    totalSupply = totalSupply.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    emit Mint(_to, _amount);
    emit Transfer(address(0), _to, _amount);
    return true;
  }
}
