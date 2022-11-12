// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "hardhat/console.sol";

error Raffle__NotEnoughtETHEntered();
error Raffle__AllBetsAreOff();
error Raffle__TransferFailed();
error Raffle__UpkeepNotNeed(uint256 currentBalance, uint256 playersLength, uint256 state);

/** @title simple lottery contract
*   @author me
*   @notice This contract allows players to enter a raffle by sending ETH to the contract.
*   The contract will pick a winner and send the prize to the winner.
*   @dev All function calls are currently implemented without side effects
*/
contract Raffle is VRFConsumerBaseV2, KeeperCompatibleInterface {
    enum State { OPEN, CALCULATING, Completed }
    /* State variables */
    uint256 private immutable i_entranceFee;
    address payable[] private s_players;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    // ограничение на использование газа. используется адрес контракта
    // проверяет текущую цену газа и отбрасывает транзакцию, если цена больше
    bytes32 private immutable i_gasLimiterKeyHash;
    // максимальная цена газа для вызова callback функции
    uint32 private immutable i_gasLimiterKeyHashCallback;
    // подписка, которая оплачивает все транзакции с chainLink
    uint64 private immutable i_subscriptionID;
    // минимальное количество подтверждений блоков, которое требуется для выполнения запроса
    // определяет то, сколько блоков chainLink будет ждать, прежде чем отправить randomNums
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant RANDOM_COUNT = 1;


    /* Lottery variables */
    address private s_winner;
    State private s_state;
    uint256 private s_lastTimestamp;
    uint256 private immutable i_lotteryInterval;

    /* Events */
    event RaffleEnter(address indexed player);
    event RequestedRaffleWinner(uint256 indexed requestId);
    event RaffleWinner(address indexed winner);

    // vrfCoordinatorAddress, entranceFee, gasLane, subscriptionID, callbackGasLimit, interval
    constructor(
        address vrfCoordinator,
        uint256 _entranceFee,
        bytes32 gasLimiterKeyHash,
        uint32 gasLimiterKeyHashCallback,
        uint64 _subscriptionID,
        uint256 lotteryTimeout
    ) VRFConsumerBaseV2(vrfCoordinator) {
        i_entranceFee = _entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        i_gasLimiterKeyHash = gasLimiterKeyHash;
        i_gasLimiterKeyHashCallback = gasLimiterKeyHashCallback;
        i_subscriptionID = _subscriptionID;
        s_state = State.OPEN;
        s_lastTimestamp = block.timestamp;
        i_lotteryInterval = lotteryTimeout;
    }

    function enterRaffle() public payable {
        if (msg.value < i_entranceFee) {
            revert Raffle__NotEnoughtETHEntered();
        }
        if (s_state != State.OPEN) {
            revert Raffle__AllBetsAreOff();
        }
        s_players.push(payable(msg.sender));
        emit RaffleEnter(msg.sender);
    }

    /**
    * @dev метод, который вызывается нодами Chainlink Keeper
    * ожидают что будет возвращено true, если есть необходимость в выполнении
    */
    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        // 1. должно пройти достаточное время
        // 2. должно быть достаточно игроков
        // 3. должно быть несколько деняг на счету контракта
        // 4. лотерея должна быть в состоянии open
        bool isOpen = s_state == State.OPEN;
        bool isTimePassed = (block.timestamp - s_lastTimestamp) > i_lotteryInterval;
        bool isEnoughPlayers = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = isOpen && isTimePassed && isEnoughPlayers && hasBalance;
        return (upkeepNeeded, "");
    }

    function performUpkeep(bytes calldata /* perfomData */) external {
        (bool ok, ) = checkUpkeep("");
        if (!ok) {
            revert Raffle__UpkeepNotNeed(
                address(this).balance,
                s_players.length,
                uint256(s_state)
            );
        }
        s_state = State.CALCULATING;
        // request random
        uint256 requestID = i_vrfCoordinator.requestRandomWords(
            i_gasLimiterKeyHash,
            i_subscriptionID,
            REQUEST_CONFIRMATIONS,
            i_gasLimiterKeyHashCallback,
            RANDOM_COUNT
        );
        emit RequestedRaffleWinner(requestID);
    }

    function fulfillRandomWords(uint256 /* requestID */, uint256[] memory randomWorlds) internal override {
        uint256 indexOfWinner = randomWorlds[0] % s_players.length;
        address payable winner = s_players[indexOfWinner];
        s_winner = winner;
        s_state = State.Completed;
        s_players = new address payable[](0);
        s_lastTimestamp = block.timestamp;
        (bool success, ) = winner.call{value: address(this).balance}("");
        if (!success) {
            revert Raffle__TransferFailed();
        }
        emit RaffleWinner(winner);
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 _index) public view returns (address) {
        return s_players[_index];
    }

    function getWinner() public view returns (address) {
        return s_winner;
    }

    function getRaffleState() public view returns (State) {
        return s_state;
    }

    function getNumWorlds() public pure returns (uint256) {
        return RANDOM_COUNT;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getLatestTimestamp() public view returns (uint256) {
        return s_lastTimestamp;
    }

    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }

    function getInterval() public view returns (uint256) {
        return i_lotteryInterval;
    }
}