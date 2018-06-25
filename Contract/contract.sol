pragma solidity 0.4.24;

contract Auction {
    address public requester;
    address public hiredFarmer;
    uint public hiredRate;
    uint public stake;
    uint public budget;

    struct Farmer {
      uint rate;
      uint stake;
    }

    mapping(address => Farmer) public farmers;

    constructor (uint _stake) public payable {
      requester = msg.sender;
      budget = msg.value;
      stake = _stake;
    }

    function addFarmer(address farmerAddress, uint farmerRate) public {
      farmers[farmerAddress].rate = farmerRate;
    }

    function acceptWork(uint rate) public payable {
      require (farmers[msg.sender].rate == rate && stake == msg.value);

      hiredFarmer = msg.sender;
      hiredRate = rate + msg.value;
    }

    function sendReward() public payable{
      hiredFarmer.transfer(hiredRate);

      //return leftover budget to requester
      uint leftover = budget - hiredRate;
      msg.sender.transfer(leftover);
    }
}
