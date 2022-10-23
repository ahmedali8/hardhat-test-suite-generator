import { testFixtureProject } from "./fixtureProject.test";
import testTokenProject from "./tokenProject.test";

describe("Hardhat Test Suite Generator", function () {
  describe("fixture-project", function () {
    testFixtureProject();
  });

  describe("token-project", function () {
    testTokenProject();
  });
});
