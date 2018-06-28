pragma solidity 0.4.24;

contract FarmingContract {
    address moderator;
    mapping(uint => Job) public jobs;
    mapping(address => Participant) public participants;

    struct Job {
      address requester;
      mapping(address => Farmer) farmers;
      uint budget;
      bool workInProgress;
      bool aborted;
    }

    struct Farmer {
      uint rate;
      bool acceptedWork;
    }

    struct Participant {
      uint balance;
    }

    event RewardSent();

    constructor () public {
      moderator = msg.sender;
    }

    function createJob(uint jobId) public payable{
      jobs[jobId].requester = msg.sender;
      jobs[jobId].budget = msg.value;
      jobs[jobId].workInProgress = false;
      jobs[jobId].aborted = false;
      participants[msg.sender].balance += msg.value;
    }

    function addFarmer(uint jobId, uint rate, address farmerAddress)
      public onlyRequester(jobId) notAborted(jobId) stillOpen(jobId) {
      // put a check so that once job has started, requester cannot change the rate
      jobs[jobId].farmers[farmerAddress].rate = rate;
      jobs[jobId].farmers[farmerAddress].acceptedWork = false;
    }

    function acceptJob(uint jobId)
    public payable onlyFarmer(jobId) stillOpen(jobId) notAborted(jobId) availableToFarm(jobId, msg.sender){
      jobs[jobId].farmers[msg.sender].acceptedWork = true;
    }

    function startJob(uint jobId)
    public onlyRequester(jobId){
      jobs[jobId].workInProgress = true;
    }

    function getRate(uint jobId) public view returns(uint rate){
      return (jobs[jobId].farmers[msg.sender].rate);
    }

    function abortJob(uint jobId) public onlyRequester(jobId) {
      jobs[jobId].aborted = true;
    }

    function withdrawFromJob(uint jobId) public stillOpen(jobId) notAborted(jobId){
      participants[msg.sender].balance += jobs[jobId].farmers[msg.sender].rate;
      jobs[jobId].farmers[msg.sender].acceptedWork = false;
      delete jobs[jobId].farmers[msg.sender].rate;
    }

    // function sendReward(string jobId) public payable onlyRequester(jobId){
    //   //TODO
    // }

    modifier stillOpen(uint jobId) {
      require(
          !(jobs[jobId].workInProgress),
          "Work has been started and no longer open for bid"
      );
      _;
    }

    modifier availableToFarm(uint jobId, address farmerAddress){
      require(
        !(jobs[jobId].farmers[farmerAddress].acceptedWork),
          "Has accepted this job"
      );
      _;
    }

    modifier notAborted(uint jobId) {
      require(
        !(jobs[jobId].aborted),
          "The requester has aborted this contract"
      );
      _;
    }


    modifier onlyFarmer(uint jobId) {
      require(
        jobs[jobId].requester != msg.sender,
          "Only farmers can bid"
      );
      _;
    }

    modifier onlyRequester(uint jobId) {
      require(
        jobs[jobId].requester == msg.sender,
          "Only requester can call this"
      );
      _;
    }
}
