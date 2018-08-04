pragma solidity ^0.4.24;

contract Farming {
    mapping(uint => Job) public jobs;

    struct Job {
      mapping(string => uint) rewards;
      uint budget;
    }

    constructor () public {
    }

    function submitJob(uint jobId) public payable{
        jobs[jobId].budget = msg.value;
    }

    function getJobBudget(uint jobId) public view returns(uint) {
        return jobs[jobId].budget;
    }

    function submitReward(uint jobId, string farmerAddress, uint reward) public {
        Job storage job = jobs[jobId];
        job.rewards[farmerAddress] = reward;
    }

    function getRewardBalance(uint jobId, string farmerAddress) public view returns(uint) {
        return jobs[jobId].rewards[farmerAddress];
    }

    function claimReward(uint jobId, string farmerAddress) public payable{
        Job storage job = jobs[jobId];
        uint reward = job.rewards[farmerAddress];
        job.rewards[farmerAddress] = 0;
        job.budget -= reward;
        msg.sender.transfer(reward);
    }
}
