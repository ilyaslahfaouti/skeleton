
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting contract", function () {
  let Voting;
  let voting;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Déployer le contrat avant chaque test
    Voting = await ethers.getContractFactory("Voting");
    [owner, addr1, addr2] = await ethers.getSigners();

    voting = await Voting.deploy();
    await voting.deployed();
  });

  describe("createPoll", function () {
    it("should create a poll", async function () {
      await expect(voting.createPoll("What is your favorite color?", ["Red", "Blue"], 3600))
        .to.emit(voting, "PollCreated")
        .withArgs(0);

      const poll = await voting.polls(0);
      expect(poll.question).to.equal("What is your favorite color?");
      expect(poll.options.length).to.equal(2);
      expect(poll.deadline).to.be.greaterThan(0);
      expect(poll.owner).to.equal(owner.address);
    });

    it("should revert if less than 2 options are provided", async function () {
      await expect(voting.createPoll("What is your favorite color?", ["Red"], 3600))
        .to.be.revertedWith("min 2 options");
    });
  });

  describe("vote", function () {
    beforeEach(async function () {
      await voting.createPoll("What is your favorite color?", ["Red", "Blue"], 3600);
    });

    it("should allow a user to vote", async function () {
      await expect(voting.connect(addr1).vote(0, 0))
        .to.emit(voting, "Voted")
        .withArgs(0, addr1.address, 0);

      const poll = await voting.polls(0);
      expect(poll.votes[0]).to.equal(1);
    });

    it("should revert if user tries to vote after the deadline", async function () {
      // Avance le temps de manière artificielle pour simuler la clôture du sondage
      await network.provider.send("evm_increaseTime", [3601]);  // 1 seconde après la deadline
      await network.provider.send("evm_mine");

      await expect(voting.connect(addr1).vote(0, 0)).to.be.revertedWith("Poll has closed");
    });

    it("should revert if user votes multiple times", async function () {
      await voting.connect(addr1).vote(0, 0);
      await expect(voting.connect(addr1).vote(0, 1)).to.be.revertedWith("You have already voted");
    });

    it("should revert if user votes for an invalid option", async function () {
      await expect(voting.connect(addr1).vote(0, 2)).to.be.revertedWith("Invalid option");
    });
  });

  describe("getResults", function () {
    beforeEach(async function () {
      await voting.createPoll("What is your favorite color?", ["Red", "Blue"], 3600);
    });

    it("should return the correct results", async function () {
      await voting.connect(addr1).vote(0, 0);
      await voting.connect(addr2).vote(0, 1);

      const results = await voting.getResults(0);
      expect(results[0]).to.equal(1);
      expect(results[1]).to.equal(1);
    });
  });
});
