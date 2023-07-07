import "@nomicfoundation/hardhat-toolbox";
import type { HardhatUserConfig } from "hardhat/types";

import "../../../src";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: "0.8.18",
  typechain: {
    outDir: "typechain",
    target: "ethers-v6",
  },
};

export default config;
