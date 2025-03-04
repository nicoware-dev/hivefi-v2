// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract Greeting {
    string private greeting ="Good Luck";

    // Constructor to initialize the greeting
    

    // Function to set a new greeting
    function setGreeting(string memory _newGreeting) public {
        greeting = _newGreeting;
    }

    // Function to get the current greeting
    function getGreeting() public view returns (string memory) {
        return greeting;
    }
}
