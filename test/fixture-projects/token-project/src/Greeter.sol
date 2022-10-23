// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.4;

import "hardhat/console.sol";

error GreeterError();

contract Greeter {
    string public greeting;

    constructor(string memory _greeting) {
        console.log("Deploying a Greeter with greeting:", _greeting);
        greeting = _greeting;
    }

    function greet() public view returns (string memory) {
        return greeting;
    }

    function setGreeting(string memory _greeting) public {
        console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
        greeting = _greeting;
    }

    function throwError() external pure {
        revert GreeterError();
    }

    function throwAnotherError() external pure {
        revert GreeterError();
    }

    function throwAnotherAnotherError() external pure {
        revert GreeterError();
    }
}

error GreeterError2();

contract Greeter2 {
    string public greeting2;

    constructor(string memory _greeting2) {
        console.log("Deploying a Greeter with greeting2:", _greeting2);
        greeting2 = _greeting2;
    }

    function greet2() public view returns (string memory) {
        return greeting2;
    }

    function setGreeting2(string memory _greeting2) public {
        console.log("Changing greeting2 from '%s' to '%s'", greeting2, _greeting2);
        greeting2 = _greeting2;
    }

    function throwError2() external pure {
        revert GreeterError2();
    }
}
