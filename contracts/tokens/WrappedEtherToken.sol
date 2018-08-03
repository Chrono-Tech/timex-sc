pragma solidity 0.4.21;

import "./MintableAndBurnableToken.sol";


contract WrappedEtherToken is MintableAndBurnableToken {

    event WethDeposit(address indexed _to, uint _value);
    event WethWithdrawal(address indexed _from, uint _value);

    function WrappedEtherToken(
        uint256 _initialAmount,
        string _tokenName,
        uint8 _decimalUnits,
        string _tokenSymbol
    // solhint-disable-next-line visibility-modifier-order
    ) MintableAndBurnableToken(
        _initialAmount,
        _tokenName,
        _decimalUnits,
        _tokenSymbol
    ) public {
    }

    function() public payable {
        deposit();
    }

    function deposit() public payable {
        balances[msg.sender] += msg.value;
        totalSupply += msg.value;
        emit WethDeposit(msg.sender, msg.value);
    }

    function withdraw(uint value) public {
        require(balanceOf(msg.sender) >= value);
        balances[msg.sender] -= value;
        totalSupply -= value;
        msg.sender.transfer(value);
        emit WethWithdrawal(msg.sender, value);
    }
}
