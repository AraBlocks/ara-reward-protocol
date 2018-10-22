pragma solidity ^0.4.24;

contract Farming {
    mapping(bytes32 => Job) public jobs;

    struct Job {
        mapping(bytes32 => uint) rewards;
        uint budget;
    }

    constructor () public {
    }

    function submitJob(bytes32 jobId) public payable{
        jobs[jobId].budget = msg.value;
    }

    function getJobBudget(bytes32 jobId) public view returns(uint) {
        return jobs[jobId].budget;
    }

    function submitReward(bytes32 jobId, bytes32 farmerId, bytes32 reward) public {
        Job storage job = jobs[jobId];
        job.rewards[farmerId] = uint(reward);
    }

    function getRewardBalance(bytes32 jobId, bytes32 farmerId) public view returns(uint) {
        return jobs[jobId].rewards[farmerId];
    }

    function claimReward(bytes32 jobId, bytes32 farmerId) public payable{
        Job storage job = jobs[jobId];
        uint reward = job.rewards[farmerId];
        job.rewards[farmerId] = 0;
        job.budget -= reward;
        msg.sender.transfer(31910898000000000);
    }
}
