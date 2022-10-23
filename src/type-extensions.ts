import "@typechain/hardhat";
import "hardhat/types/config";

import type { TestSuiteGeneratorConfig, TestSuiteGeneratorUserConfig } from "./types";

declare module "hardhat/types/config" {
  interface HardhatUserConfig {
    testSuiteGenerator?: TestSuiteGeneratorUserConfig;
  }

  interface HardhatConfig {
    testSuiteGenerator: TestSuiteGeneratorConfig;
  }
}
