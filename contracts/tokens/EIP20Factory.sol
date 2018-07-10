pragma solidity 0.4.21;

import "./EIP20.sol";
import "./EIP20Interface.sol";


contract EIP20Factory {

    function createEIP20(
        uint256 _initialAmount,
        string _name,
        uint8 _decimals,
        string _symbol
    ) public returns (address) {
        EIP20Interface newToken = EIP20Interface(new EIP20(_initialAmount, _name, _decimals, _symbol));
        //the factory will own the created tokens. You must transfer them.
        newToken.transfer(msg.sender, _initialAmount);
        return address(newToken);
    }
}
