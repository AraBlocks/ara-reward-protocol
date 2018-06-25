pragma solidity 0.4.24;

contract Auction {
    address public requester;
    address public hiredFarmer;
    uint256 public hiredRate;
    uint256 public stake;
    uint256 public budget;

    struct Farmer {
      uint256 rate;
    }

    mapping(address => Farmer) public farmers;

    constructor (uint256 _stake) public payable {
      requester = msg.sender;
      budget = msg.value;
      stake = _stake;
    }

    function addFarmer(address farmerAddress, uint256 farmerRate) public {
      farmers[farmerAddress].rate = farmerRate;
    }

    function acceptWork(uint256 rate) public payable {
      if (farmers[msg.sender].rate != rate && stake != msg.value) revert();
      hiredFarmer = msg.sender;
      hiredRate = farmers[msg.sender].rate + stake;
    }

    function sendReward() public payable{
      hiredFarmer.transfer(hiredRate);

      //return leftover budget to requester
      uint256 leftover = budget - hiredRate;
      msg.sender.transfer(leftover);
    }
}
