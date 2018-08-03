pragma solidity 0.4.21;

import "./EIP20.sol";
import "../utils/SafeMathLibrary.sol";


contract MintableAndBurnableToken is EIP20 {
    using SafeMathLibrary for uint256;

    function MintableAndBurnableToken(
        uint256 _initialAmount,
        string _tokenName,
        uint8 _decimalUnits,
        string _tokenSymbol
        // solhint-disable-next-line visibility-modifier-order
    ) EIP20(
        _initialAmount,
        _tokenName,
        _decimalUnits,
        _tokenSymbol
    ) public {
    }

    event Burn(address indexed _from, uint256 _value);
    event WithdrawalBurn(address indexed _from, uint256 _value, string externalAddress);
    event Mint(address indexed _to, uint256 _value);

    /**
     * @dev Burns a specific amount of tokens.
     * @param _value The amount of token to be burned.
     */
    function burn(address _who, uint256 _value) public onlyOwner {
        require(_value <= balances[_who]);
        // no need to require value <= totalSupply, since that would imply the
        // sender's balance is greater than the totalSupply, which *should* be an assertion failure

        balances[_who] = balances[_who].safeSub(_value);
        totalSupply = totalSupply.safeSub(_value);
        emit Burn(_who, _value);
    }

    /**
     * @dev Burns a specific amount of tokens for withdraw
     */
    function withdrawBurn(uint256 _value, string externalAddress) public {
        address _who = msg.sender;
        require(_value <= balances[_who]);
        // no need to require value <= totalSupply, since that would imply the
        // sender's balance is greater than the totalSupply, which *should* be an assertion failure

        balances[_who] = balances[_who].safeSub(_value);
        totalSupply = totalSupply.safeSub(_value);
        emit WithdrawalBurn(_who, _value, externalAddress);
    }

    /**
     * @dev Function to mint tokens
     * @param _to The address that will receive the minted tokens.
     * @param _amount The amount of tokens to mint.
     * @return A boolean that indicates if the operation was successful.
     */
    function mint (address _to, uint256 _amount) public onlyOwner returns (bool) {
        totalSupply = totalSupply.safeAdd(_amount);
        balances[_to] = balances[_to].safeAdd(_amount);
        emit Mint(_to, _amount);
        return true;
    }
}
