# Hardhat Test Suite Generator [![GitHub Actions][gha-badge]][gha] [![Coverage Status][coveralls-badge]][coveralls] [![Styled with Prettier][prettier-badge]][prettier] [![License: MIT][license-badge]][license]

[gha]: https://github.com/ahmedali8/hardhat-test-suite-generator/actions
[gha-badge]:
  https://github.com/ahmedali8/hardhat-test-suite-generator/actions/workflows/ci.yml/badge.svg
[coveralls]: https://coveralls.io/github/ahmedali8/hardhat-test-suite-generator
[coveralls-badge]:
  https://coveralls.io/repos/github/ahmedali8/hardhat-test-suite-generator/badge.svg?branch=main
[prettier]: https://prettier.io
[prettier-badge]: https://img.shields.io/badge/Code_Style-Prettier-ff69b4.svg
[license]: https://opensource.org/licenses/MIT
[license-badge]: https://img.shields.io/badge/License-MIT-blue.svg

Hardhat plugin for generating a test suite structure for smart contracts

## Description

This plugin builds on top the
[TypeChain plugin](https://github.com/ethereum-ts/TypeChain/tree/master/packages/hardhat),
[Hardhat toolbox](https://github.com/NomicFoundation/hardhat/tree/main/packages/hardhat-toolbox),
[Hardhat network helpers](https://github.com/NomicFoundation/hardhat/tree/main/packages/hardhat-network-helpers)
and
[Hardhat chai matchers](https://github.com/NomicFoundation/hardhat/tree/main/packages/hardhat-chai-matchers).
More specifically, it creates a separate file for each function of the contract that is not in the
exclude contract list generating a directory structure for each contract and a shared folder for
types.

## Installation

First, install the plugin and its peer dependencies.

```sh
yarn add --dev hardhat-test-suite-generator @nomicfoundation/hardhat-toolbox
```

Second, import the plugin in your `hardhat.config.ts`:

```typescript
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-test-suite-generator";
```

## Required plugins

- [@typechain/hardhat](https://github.com/ethereum-ts/TypeChain/tree/master/packages/hardhat)
- [@nomicfoundation/hardhat-toolbox](https://github.com/NomicFoundation/hardhat/tree/main/packages/hardhat-toolbox)

## Tasks

This plugin adds the _generate-test-suite_ task to Hardhat:

```text
Generates a test suite structure for smart contracts
```

## Environment Extensions

This plugin does not extend the Hardhat Runtime Environment.

## Configuration

This plugin extends the `HardhatUserConfig` object with an optional `testSuiteGenerator` object.
This object contains two fields, `excludeContracts` and `outDirName`. `excludeContracts` is an array
of strings that represent the names of the smart contracts in your project to exclude. The plugin
uses this array and eliminates these contracts from the test suite structure. `outDirName` is a
string name e.g. "test".

An example for how to set it:

```javascript
module.exports = {
  testSuiteGenerator: {
    // What contracts to exclude from the test suite
    // Defaults to []
    excludeContracts: ["MyToken", "ERC20"],
    // Out directory name for the test suite
    // Must not contain "/"
    // Defaults to "test"
    outDirName: "test",
  },
};
```

## Usage

Run this:

```sh
yarn hardhat generate-test-suite
```

And go look what you got in the `test` directory. For excluding any contract or renaming the test
folder name refer to the [configuration](./README.md#configuration) section above.

## FAQ

### I get an error when using Yarn

make sure these packages are present in your `dependencies` or `devDependencies`:

```sh
yarn add --dev \
  @nomicfoundation/hardhat-chai-matchers \
  @nomicfoundation/hardhat-network-helpers \
  @nomicfoundation/hardhat-toolbox \
  @nomiclabs/hardhat-ethers \
  @nomiclabs/hardhat-etherscan \
  @typechain/ethers-v5 \
  chai \
  hardhat-gas-reporter \
  solidity-coverage \
  ts-node \
  typescript
```

## License

[MIT](./LICENSE.md) © Ahmed Ali
