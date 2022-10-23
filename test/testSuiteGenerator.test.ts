/* eslint-disable @typescript-eslint/no-empty-function, no-empty-pattern */
import { TASK_TYPECHAIN } from "@typechain/hardhat/dist/constants";
import { execSync } from "child_process";
import type { Mock } from "earljs";
import { expect, mockFn } from "earljs";
import fsExtra from "fs-extra";
import { TASK_COMPILE, TASK_TEST } from "hardhat/builtin-tasks/task-names";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import path from "path";

import { TASK_GENERATE_TEST_SUITE } from "../src/constants";
import { useHardhatEnvironment } from "./helpers";

const pathToArtifacts: string = path.join(__dirname, "fixture-project/artifacts");
const pathToTestFolder: string = path.join(__dirname, "fixture-project/test");

function testContractAStructure(expectedBool: boolean): void {
  // Contract: A
  // a/A.ts
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/a/A.ts"))).toEqual(expectedBool);
  // a/A.fixture.ts
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/a/A.fixture.ts"))).toEqual(
    expectedBool,
  );
  // a/A.behavior.ts
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/a/A.behavior.ts"))).toEqual(
    expectedBool,
  );
  // view/a.ts
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/a/view/a.ts"))).toEqual(expectedBool);
  // view/b.ts
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/a/view/b.ts"))).toEqual(expectedBool);
  // view/c.ts
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/a/view/c.ts"))).toEqual(expectedBool);
}

function testContractBStructure(expectedBool: boolean): void {
  // Contract: B
  // b/B.ts
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/b/B.ts"))).toEqual(expectedBool);
  // b/B.fixture.ts
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/b/B.fixture.ts"))).toEqual(
    expectedBool,
  );
  // b/B.behavior.ts
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/b/B.fixture.ts"))).toEqual(
    expectedBool,
  );
  // view/b.ts
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/b/view/b.ts"))).toEqual(expectedBool);
  // view/c.ts
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/b/view/c.ts"))).toEqual(expectedBool);
}

function testContractCStructure(expectedBool: boolean): void {
  // Contract: C
  // c/C.ts
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/c/C.ts"))).toEqual(expectedBool);
  // c/C.fixture.ts
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/c/C.fixture.ts"))).toEqual(
    expectedBool,
  );
  // c/C.behavior.ts
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/c/C.behavior.ts"))).toEqual(
    expectedBool,
  );
  // view/c.ts
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/c/view/c.ts"))).toEqual(expectedBool);
}

function testContractDStructure(expectedBool: boolean): void {
  // Contract: D
  // d/D.ts
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/d/D.ts"))).toEqual(expectedBool);
  // d/D.fixture.ts
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/d/D.fixture.ts"))).toEqual(
    expectedBool,
  );
  // d/D.behavior.ts
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/d/D.behavior.ts"))).toEqual(
    expectedBool,
  );
  // view/d.ts
  expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/d/view/d.ts"))).toEqual(expectedBool);
}

describe("Hardhat Test Suite Generator", function () {
  useHardhatEnvironment();

  let originalConsoleLog: any;
  let consoleLogMock: Mock<any, any>;

  beforeEach(async function () {
    await this.hre.run("clean");
    fsExtra.removeSync(pathToTestFolder);

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
            this.hre.config.testSuiteGenerator.excludeContracts = ["B", "D"];
          });

          it("generates the test suite structure for contracts other than excluded ones", async function () {
            await this.hre.run(TASK_GENERATE_TEST_SUITE);

            expect(fsExtra.existsSync(pathToArtifacts)).toEqual(true);

            // Test folder
            expect(fsExtra.existsSync(pathToTestFolder)).toEqual(true);

            // Contract: A
            testContractAStructure(true);

            // Contract: B
            testContractBStructure(false);

            // Contract: C
            testContractCStructure(true);

            // Contract: D
            testContractDStructure(false);

            // test/unit/index.ts
            expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/index.ts"))).toEqual(true);

            // test/shared/types.ts
            expect(fsExtra.existsSync(path.join(pathToTestFolder, "shared/types.ts"))).toEqual(
              true,
            );

            expect(consoleLogMock).toHaveBeenCalledWith(["Generating suite for 2 contracts ..."]);
            expect(consoleLogMock).toHaveBeenCalledWith([
              "Successfully generated 12 files in test suite!",
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

            // Contract: A
            testContractAStructure(true);

            // Contract: B
            testContractBStructure(true);

            // Contract: C
            testContractCStructure(true);

            // Contract: D
            testContractDStructure(true);

            // test/unit/index.ts
            expect(fsExtra.existsSync(path.join(pathToTestFolder, "unit/index.ts"))).toEqual(true);

            // test/shared/types.ts
            expect(fsExtra.existsSync(path.join(pathToTestFolder, "shared/types.ts"))).toEqual(
              true,
            );

            expect(consoleLogMock).toHaveBeenCalledWith(["Generating suite for 4 contracts ..."]);
            expect(consoleLogMock).toHaveBeenCalledWith([
              "Successfully generated 21 files in test suite!",
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
  });
});
