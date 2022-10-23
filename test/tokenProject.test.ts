/* eslint-disable @typescript-eslint/no-empty-function, no-empty-pattern */
import { TASK_TYPECHAIN } from "@typechain/hardhat/dist/constants";
import { execSync } from "child_process";
import type { Mock } from "earljs";
import { expect, mockFn } from "earljs";
import fsExtra from "fs-extra";
import { TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import path from "path";

import { TASK_GENERATE_TEST_SUITE } from "../src/constants";
import { hyphenate, pascalCase } from "../src/utils/string";
import { useHardhatEnvironment } from "./helpers";

const pathToArtifacts: string = path.join(
  __dirname,
  "fixture-projects/token-project/hardhat_artifacts",
);
const pathToTestFolder: string = path.join(
  __dirname,
  "fixture-projects/token-project/hardhat_test",
);

export default function testTokenProject() {
  useHardhatEnvironment("token-project");

  let originalConsoleLog: any;
  let consoleLogMock: Mock<any, any>;

  beforeEach(async function () {
    await this.hre.run("clean");

    consoleLogMock = mockFn().returns(undefined);
    originalConsoleLog = console.log;
    console.log = consoleLogMock;
  });

  context("when outDirName contains '/'", function () {
    beforeEach(async function () {
      this.hre.config.testSuiteGenerator.outDirName = "out/test";
    });

    it("throws an error", async function () {
      await expect(this.hre.run(TASK_GENERATE_TEST_SUITE)).toBeRejected(
        "Incorrect outDirName. Please do not use / in name.",
      );
    });
  });

  context("when outDirName is valid", function () {
    beforeEach(async function () {
      this.hre.config.testSuiteGenerator.outDirName = "hardhat_test";
    });

    context("when the contract artifacts do not exist", function () {
      beforeEach(async function () {
        task(TASK_TYPECHAIN, "Disable the TypeChain task").setAction(
          async function (): Promise<void> {},
        );
      });

      it("throws an error", async function () {
        await expect(this.hre.run(TASK_GENERATE_TEST_SUITE)).toBeRejected(
          "Please generate the contract artifacts before running this plugin",
        );
      });
    });

    context("when the contract artifacts exist", function () {
      context("when the TypeChain bindings do not exist", function () {
        beforeEach(async function () {
          task(TASK_COMPILE, "Override the Hardhat compile subtask").setAction(async function (
            taskArguments: TaskArguments,
            {},
            runSuper,
          ) {
            await runSuper({ ...taskArguments, noTypechain: true });
          });
        });

        it("throws an error", async function () {
          await expect(this.hre.run(TASK_GENERATE_TEST_SUITE)).toBeRejected(
            "Please generate the TypeChain bindings before running this plugin",
          );
        });
      });

      context("when the TypeChain bindings exist", function () {
        context("when the user decided to exclude contracts", function () {
          beforeEach(async function () {
            this.hre.config.testSuiteGenerator.excludeContracts = ["Greeter"];
          });

          it("generates the test suite structure for contracts other than excluded ones", async function () {
            await this.hre.run(TASK_GENERATE_TEST_SUITE);

            expect(fsExtra.existsSync(pathToArtifacts)).toEqual(true);

            // Test folder
            expect(fsExtra.existsSync(pathToTestFolder)).toEqual(true);
            // AnotherToken
            testContractTokenStructure("AnotherToken", true);
            // FireToken
            testContractTokenStructure("FireToken", true);
            // Greeter
            testContractGreeterStructure(false);
            // Greeter2
            testContractGreeter2Structure(true);
            // TestToken
            testContractTokenStructure("TestToken", true);
            // Token
            testContractTokenStructure("Token", true);

            expect(consoleLogMock).toHaveBeenCalledWith(["Generating suite for 5 contracts ..."]);
            expect(consoleLogMock).toHaveBeenCalledWith([
              "Successfully generated 69 files in test suite!",
            ]);

            // run TASK_TEST without stdout in terminal.
            execSync("yarn hardhat test");
          });
        });

        context("when the user decided to not exclude any contract", function () {
          beforeEach(async function () {
            this.hre.config.testSuiteGenerator.excludeContracts = [];
          });

          it("generates the test suite structure for all contracts", async function () {
            await this.hre.run(TASK_GENERATE_TEST_SUITE);

            expect(fsExtra.existsSync(pathToArtifacts)).toEqual(true);

            // Test folder
            expect(fsExtra.existsSync(pathToTestFolder)).toEqual(true);
            // AnotherToken
            testContractTokenStructure("AnotherToken", true);
            // FireToken
            testContractTokenStructure("FireToken", true);
            // Greeter
            testContractGreeterStructure(true);
            // Greeter2
            testContractGreeter2Structure(true);
            // TestToken
            testContractTokenStructure("TestToken", true);
            // Token
            testContractTokenStructure("Token", true);

            expect(consoleLogMock).toHaveBeenCalledWith(["Generating suite for 6 contracts ..."]);
            expect(consoleLogMock).toHaveBeenCalledWith([
              "Successfully generated 78 files in test suite!",
            ]);

            // run TASK_TEST without stdout in terminal.
            execSync("yarn hardhat test");
          });
        });
      });
    });
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    fsExtra.removeSync(pathToTestFolder);
  });
}

function testContractTokenStructure(name: string, expectedBoolean: boolean): void {
  const folderName = hyphenate(name);
  const contractName = pascalCase(name);

  expect(
    fsExtra.existsSync(path.join(pathToTestFolder, `unit/${folderName}/${contractName}.ts`)),
  ).toEqual(expectedBoolean);
  expect(
    fsExtra.existsSync(
      path.join(pathToTestFolder, `unit/${folderName}/${contractName}.fixture.ts`),
    ),
  ).toEqual(expectedBoolean);
  expect(
    fsExtra.existsSync(
      path.join(pathToTestFolder, `unit/${folderName}/${contractName}.behavior.ts`),
    ),
  ).toEqual(expectedBoolean);
  expect(
    fsExtra.existsSync(path.join(pathToTestFolder, `unit/${folderName}/effects/approve.ts`)),
  ).toEqual(expectedBoolean);
  expect(
    fsExtra.existsSync(
      path.join(pathToTestFolder, `unit/${folderName}/effects/decreaseAllowance.ts`),
    ),
  ).toEqual(expectedBoolean);
  expect(
    fsExtra.existsSync(
      path.join(pathToTestFolder, `unit/${folderName}/effects/increaseAllowance.ts`),
    ),
  ).toEqual(expectedBoolean);
  expect(
    fsExtra.existsSync(path.join(pathToTestFolder, `unit/${folderName}/effects/mint.ts`)),
  ).toEqual(expectedBoolean);
  expect(
    fsExtra.existsSync(path.join(pathToTestFolder, `unit/${folderName}/effects/transfer.ts`)),
  ).toEqual(expectedBoolean);
  expect(
    fsExtra.existsSync(path.join(pathToTestFolder, `unit/${folderName}/effects/transferFrom.ts`)),
  ).toEqual(expectedBoolean);
  expect(
    fsExtra.existsSync(path.join(pathToTestFolder, `unit/${folderName}/view/allowance.ts`)),
  ).toEqual(expectedBoolean);
  expect(
    fsExtra.existsSync(path.join(pathToTestFolder, `unit/${folderName}/view/balanceOf.ts`)),
  ).toEqual(expectedBoolean);
  expect(
    fsExtra.existsSync(path.join(pathToTestFolder, `unit/${folderName}/view/decimals.ts`)),
  ).toEqual(expectedBoolean);
  expect(
    fsExtra.existsSync(path.join(pathToTestFolder, `unit/${folderName}/view/name.ts`)),
  ).toEqual(expectedBoolean);
  expect(
    fsExtra.existsSync(path.join(pathToTestFolder, `unit/${folderName}/view/symbol.ts`)),
  ).toEqual(expectedBoolean);
  expect(
    fsExtra.existsSync(path.join(pathToTestFolder, `unit/${folderName}/view/totalSupply.ts`)),
  ).toEqual(expectedBoolean);
}

function testContractGreeterStructure(expectedBool: boolean): void {
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/greeter/Greeter.ts"))).toEqual(
    expectedBool,
  );
  expect(
    fsExtra.existsSync(path.join(pathToTestFolder, "unit/greeter/Greeter.fixture.ts")),
  ).toEqual(expectedBool);
  expect(
    fsExtra.existsSync(path.join(pathToTestFolder, "unit/greeter/Greeter.behavior.ts")),
  ).toEqual(expectedBool);
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/greeter/view/greet.ts"))).toEqual(
    expectedBool,
  );
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/greeter/view/greeting.ts"))).toEqual(
    expectedBool,
  );
  expect(
    fsExtra.existsSync(
      path.join(pathToTestFolder, "unit/greeter/view/throwAnotherAnotherError.ts"),
    ),
  ).toEqual(expectedBool);
  expect(
    fsExtra.existsSync(path.join(pathToTestFolder, "unit/greeter/view/throwAnotherError.ts")),
  ).toEqual(expectedBool);
  expect(
    fsExtra.existsSync(path.join(pathToTestFolder, "unit/greeter/view/throwError.ts")),
  ).toEqual(expectedBool);
  expect(
    fsExtra.existsSync(path.join(pathToTestFolder, "unit/greeter/effects/setGreeting.ts")),
  ).toEqual(expectedBool);
}

function testContractGreeter2Structure(expectedBool: boolean): void {
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/greeter2/Greeter2.ts"))).toEqual(
    expectedBool,
  );
  expect(
    fsExtra.existsSync(path.join(pathToTestFolder, "unit/greeter2/Greeter2.fixture.ts")),
  ).toEqual(expectedBool);
  expect(
    fsExtra.existsSync(path.join(pathToTestFolder, "unit/greeter2/Greeter2.behavior.ts")),
  ).toEqual(expectedBool);
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/greeter2/view/greet2.ts"))).toEqual(
    expectedBool,
  );
  expect(
    fsExtra.existsSync(path.join(pathToTestFolder, "unit/greeter2/view/greeting2.ts")),
  ).toEqual(expectedBool);
  expect(
    fsExtra.existsSync(path.join(pathToTestFolder, "unit/greeter2/view/throwError2.ts")),
  ).toEqual(expectedBool);
  expect(
    fsExtra.existsSync(path.join(pathToTestFolder, "unit/greeter2/effects/setGreeting2.ts")),
  ).toEqual(expectedBool);
}
