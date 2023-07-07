import "@nomicfoundation/hardhat-toolbox";
import type { HardhatUserConfig } from "hardhat/types";

import "../../../src";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  paths: {
    artifacts: "./hardhat_artifacts",
    cache: "./hardhat_cache",
    sources: "./src",
    tests: "./hardhat_test",
  },
  solidity: "0.8.18",
  typechain: {
    outDir: "types",
    target: "ethers-v6",
  },
};

export default config;
