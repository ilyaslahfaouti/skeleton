// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Voting - simple poll-based voting contract (squelette)
contract Voting {
    struct Poll {
        string question;
        string[] options;
        uint[] votes;
        uint deadline;
        address owner;
    }

    uint public pollCount;
    mapping(uint => Poll) public polls;
    mapping(uint => mapping(address => bool)) public voted;

    event PollCreated(uint pollId);
    event Voted(uint pollId, address voter, uint option);

    /// @notice create a new poll
    /// @param q The question
    /// @param opts array of options (min 2)
    /// @param dur duration in seconds
    function createPoll(string calldata q, string[] calldata opts, uint dur) external {
        require(opts.length >= 2, "min 2 options");

        // Initialisation du sondage
        uint pollId = pollCount;
        Poll storage newPoll = polls[pollId];
        newPoll.question = q;
        newPoll.options = opts;
        newPoll.votes = new uint[](opts.length);  // Initialise le tableau des votes à 0
        newPoll.deadline = block.timestamp + dur;
        newPoll.owner = msg.sender;

        // Incrémenter le compteur de sondages
        pollCount++;

        // Émettre l'événement PollCreated
        emit PollCreated(pollId);
    }

    /// @notice vote on a poll
    /// @param id poll id
    /// @param opt index of option
    function vote(uint id, uint opt) external {
        Poll storage p = polls[id];

        // Vérifier si le sondage est encore actif (deadline non atteinte)
        require(block.timestamp < p.deadline, "Poll has closed");

        // Vérifier si l'adresse a déjà voté
        require(!voted[id][msg.sender], "You have already voted");

        // Vérifier si l'option est valide
        require(opt < p.options.length, "Invalid option");

        // Enregistrer le vote
        p.votes[opt]++;
        voted[id][msg.sender] = true;

        // Émettre l'événement Voted
        emit Voted(id, msg.sender, opt);
    }

    /// @notice view results
    function getResults(uint id) external view returns (uint[] memory) {
        return polls[id].votes;
    }
}
