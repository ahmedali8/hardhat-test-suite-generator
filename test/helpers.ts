import { resetHardhatContext } from "hardhat/plugins-testing";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import path from "path";

declare module "mocha" {
  interface Context {
    hre: HardhatRuntimeEnvironment;
  }
}

export function useHardhatEnvironment() {
  beforeEach("Loading hardhat environment", function () {
    process.chdir(path.join(__dirname, "fixture-project"));

    this.hre = require("hardhat");
  });

  afterEach("Resetting hardhat", function () {
    resetHardhatContext();
  });
}
