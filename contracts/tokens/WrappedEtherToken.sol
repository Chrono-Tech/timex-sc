pragma solidity 0.4.21;

import "./MintableAndBurnableToken.sol";


contract WrappedEtherToken is MintableAndBurnableToken {

    event Deposit(address indexed dst, uint wad);
    event Withdrawal(address indexed src, uint wad);

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
