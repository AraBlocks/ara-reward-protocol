pragma solidity 0.4.24;

contract Auction {
    address public requester;
    address public hiredFarmer;
    uint public hiredRate;
    uint public stake;
    uint public budget;
    bool public workInProgress;
    bool public aborted;

    struct Farmer {
      uint rate;
    }

    mapping(address => Farmer) public farmers;

    event WorkAccepted(address farmer, uint rate);
    event RewardSent();

    constructor (uint _stake) public payable {
      requester = msg.sender;
      budget = msg.value;
      stake = _stake;
      workInProgress = false;
      aborted = false;
    }

    function abortWork() public onlyRequester returns (bool) {
      if (workInProgress && !aborted) {
        return false;
      } else {
        aborted = true;
        requester.transfer(budget);
        return true;
      }
    }

    function addFarmer(address farmerAddress, uint farmerRate)
      public onlyRequester notAborted stillOpen {
      farmers[farmerAddress].rate = farmerRate;
    }

    function acceptWork(uint rate)
    public payable onlyFarmer notAborted stillOpen{
      require (farmers[msg.sender].rate == rate, "Rate must equal to \(farmers[msg.sender].rate)");
      require (stake == msg.value, "Stake value must equal to \(stake)");
      workInProgress = true;
      hiredFarmer = msg.sender;
      hiredRate = rate;

      emit WorkAccepted(msg.sender, rate);
    }

    function sendReward() public payable onlyRequester notAborted{
      // sends reward and gives back stake to farmer
      hiredFarmer.transfer(hiredRate + stake);

      //return leftover budget to requester
      uint leftover = budget - (hiredRate + stake);
      msg.sender.transfer(leftover);

      delete requester;
      delete hiredFarmer;
      delete hiredRate;
      delete stake;
      delete budget;
      delete workInProgress;
      delete aborted;

      emit RewardSent();
    }

    modifier stillOpen() {
      require(
          !workInProgress,
          "Work has been started and no longer open for bid"
      );
      _;
    }

    modifier notAborted() {
      require(
          !aborted,
          "The requester has aborted this contract"
      );
      _;
    }

    modifier onlyFarmer() {
      require(
          msg.sender != requester,
          "Only farmer can bid"
      );
      _;
    }

    modifier onlyRequester() {
      require(
          msg.sender == requester,
          "Only requester can call this"
      );
      _;
    }
}
