// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract AmloFest{
    string public name;
    string public symbol;
    uint8 public decimals; 

    uint256 public _totalSupply;

    mapping(address => uint) balsOf;
    mapping(address => mapping(address => uint)) allow;

    constructor(){
        name = "AmloFest";
        symbol = "AMF";
        decimals = 0;
        _totalSupply = 50000;

        balsOf[msg.sender] = _totalSupply;
    }

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    function totalSupply() public view returns (uint) {
        return _totalSupply  - balsOf[address(0)];
    }


    function allowance(address tokenOwner, address spender) public view returns (uint remaining) {
        return allow[tokenOwner][spender];
    }

    function approve(address spender, uint tokens) public returns (bool success) {
        allow[msg.sender][spender] = tokens;
        emit Approval(msg.sender, spender, tokens);
        return true;
    }

    function transfer(address _to, uint256 _value) public returns (bool success){
        require(balsOf[msg.sender] >= _value);
        balsOf[msg.sender] -= _value;
        balsOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success){
        require(balsOf[_from] >= _value);

        require(allow[_from][msg.sender] >= _value); 
        balsOf[_from] -= _value;
        balsOf[_to] += _value;
        allow[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

}