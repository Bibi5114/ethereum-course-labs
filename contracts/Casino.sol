// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * Educational adaptation of merlox/casino-ethereum.
 * Owner commits to a secret before betting, then reveals after the round.
 * WARNING: Owner can refuse to reveal. Do not use with real money.
 */
contract Casino {
    address public immutable owner;
    uint256 public immutable minimumBet;
    uint256 public immutable maxAmountOfBets;
    bytes32 public immutable commitment;
    uint256 public numberOfBets;
    uint256 public totalBet;
    uint256 public numberWinner;
    bool public roundFinished;
    mapping(address => bool) public hasBet;
    mapping(uint256 => address[]) private playersByNumber;
    mapping(address => uint256) public winnings;

    event BetPlaced(address indexed player, uint256 number, uint256 amount);
    event RoundFinished(uint256 winningNumber, uint256 winners, uint256 prizePerWinner);

    constructor(uint256 _minimumBet, uint256 _maxAmountOfBets, bytes32 _commitment) {
        require(_minimumBet > 0, "Minimum must be positive");
        require(_maxAmountOfBets > 0 && _maxAmountOfBets <= 100, "Choose 1-100");
        require(_commitment != bytes32(0), "Commitment required");
        owner = msg.sender;
        minimumBet = _minimumBet;
        maxAmountOfBets = _maxAmountOfBets;
        commitment = _commitment;
    }

    function bet(uint256 numberToBet) external payable {
        require(!roundFinished && numberOfBets < maxAmountOfBets, "Betting closed");
        require(!hasBet[msg.sender], "One bet per address");
        require(numberToBet >= 1 && numberToBet <= 10, "Choose 1-10");
        require(msg.value >= minimumBet, "Bet below minimum");
        hasBet[msg.sender] = true;
        playersByNumber[numberToBet].push(msg.sender);
        numberOfBets++;
        totalBet += msg.value;
        emit BetPlaced(msg.sender, numberToBet, msg.value);
    }

    // Secret must be committed BEFORE deployment: keccak256(abi.encodePacked(secret)).
    // This is NOT a trustless random oracle: the owner can withhold the reveal.
    function revealAndFinish(bytes32 secret) external {
        require(msg.sender == owner, "Only owner");
        require(numberOfBets == maxAmountOfBets, "Wait for all bets");
        require(!roundFinished, "Already finished");
        require(keccak256(abi.encodePacked(secret)) == commitment, "Wrong secret");
        roundFinished = true;
        numberWinner = uint256(keccak256(abi.encodePacked(secret))) % 10 + 1;
        uint256 count = playersByNumber[numberWinner].length;
        uint256 prize = count == 0 ? 0 : totalBet / count;
        for (uint256 i = 0; i < count; i++) {
            winnings[playersByNumber[numberWinner][i]] += prize;
        }
        emit RoundFinished(numberWinner, count, prize);
    }

    function withdraw() external {
        uint256 amount = winnings[msg.sender];
        require(amount > 0, "Nothing to withdraw");
        winnings[msg.sender] = 0;
        (bool success,) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
