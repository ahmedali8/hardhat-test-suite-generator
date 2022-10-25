import { TASK_TYPECHAIN } from "@typechain/hardhat/dist/constants";
import fsExtra from "fs-extra";
import { extendConfig, task } from "hardhat/config";
import { HardhatPluginError } from "hardhat/plugins";
import type {
  HardhatConfig,
  HardhatRuntimeEnvironment,
  HardhatUserConfig,
  TaskArguments,
} from "hardhat/types";
import { join, relative, resolve } from "path";
import { glob } from "typechain";
import type { Contract, FileDescription } from "typechain";
import { loadFileDescriptions, skipEmptyAbis } from "typechain/dist/typechain/io";

import { PLUGIN_NAME, TASK_GENERATE_TEST_SUITE } from "./constants";
import "./type-extensions";
import type { TestSuiteGeneratorConfig } from "./types";
import { debug } from "./utils/debug";
import { genIndexFile, genSharedTypesFile } from "./utils/generate";
import type { HelperConfig } from "./utils/helpers";
import { processOutput } from "./utils/output";
import { services } from "./utils/services";
import { transformContract } from "./utils/transform";

extendConfig((config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
  const defaultTestSuiteGeneratorConfig: TestSuiteGeneratorConfig = {
    excludeContracts: [],
    outDirName: "test",
  };

  config.testSuiteGenerator = {
    ...defaultTestSuiteGeneratorConfig,
    ...userConfig.testSuiteGenerator,
  };
});

task(TASK_GENERATE_TEST_SUITE, "Generates a test suite structure for smart contracts").setAction(
  async function (_taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment): Promise<void> {
    const cwd: string = hre.config.paths.root;
    const pathToBindings: string = join(cwd, hre.config.typechain.outDir);

    // testSuiteGenerator.outDirName must not contain "/".
    if (hre.config.testSuiteGenerator.outDirName.indexOf("/") !== -1) {
      throw new HardhatPluginError(
        PLUGIN_NAME,
        "Incorrect outDirName. Please do not use / in name.",
      );
    }

    // Run the TypeChain task first. This runs the "compile" task internally, so the contract artifacts are generated too.
    await hre.run(TASK_TYPECHAIN);

    if (!fsExtra.existsSync(hre.config.paths.artifacts)) {
      throw new HardhatPluginError(
        PLUGIN_NAME,
        "Please generate the contract artifacts before running this plugin",
      );
    }

    if (!fsExtra.existsSync(pathToBindings)) {
      throw new HardhatPluginError(
        PLUGIN_NAME,
        "Please generate the TypeChain bindings before running this plugin",
      );
    }

    // const outDirName: string = hre.config.testSuiteGenerator.outDirName;

    // if (fsExtra.existsSync(join(cwd, outDirName))) {
    //   console.log(`Test Suite already exists!`);
    //   return;
    // }

    const relativePathToContractsSources: string = relative(cwd, hre.config.paths.sources);
    const artifactFiles = glob(cwd, [
      `${hre.config.paths.artifacts}/${
        relativePathToContractsSources === "" ? "!(build-info)" : relativePathToContractsSources
      }/**/+([a-zA-Z0-9_]).json`,
    ]);
    debug("artifactFiles > ", artifactFiles);

    const allFiles: string[] = skipEmptyAbis(artifactFiles);
    debug("allFiles > ", allFiles);

    const isContractsSourcesPresent: boolean = fsExtra.existsSync(
      join(pathToBindings, relativePathToContractsSources),
    );

    const helperConfig: HelperConfig = {
      cwd: cwd,
      outDirAbs: resolve(cwd, hre.config.testSuiteGenerator.outDirName),
      allFiles: allFiles,
      typechainOutDir: hre.config.typechain.outDir,
      contractsSources: isContractsSourcesPresent ? relativePathToContractsSources : "",
    };

    const fileDescriptions: FileDescription[] = loadFileDescriptions(
      services,
      helperConfig.allFiles,
    );
    debug("fileDescriptions > ", fileDescriptions);

    // List of contracts to be excluded.
    const excludeContracts: string[] = hre.config.testSuiteGenerator.excludeContracts;

    // Let the user know that the suite is being generated.
    console.log(`Generating suite for ${allFiles.length - excludeContracts.length} contracts ...`);

    const contracts: Contract[] = [];
    const outputs: FileDescription[] = [];

    for (const fd of fileDescriptions) {
      debug(`Processing ${relative(cwd, fd.path)}`);

      const output = transformContract(fd, helperConfig);

      if (!output) {
        throw new HardhatPluginError(PLUGIN_NAME, `Error in ${fd.path}`);
      }

      const {
        contract,
        viewOutputs,
        effectOutputs,
        fixtureOutput,
        behaviorOutput,
        contractOutput,
      } = output;

      // Skip loop for excluded contracts.
      if (excludeContracts.length !== 0 && excludeContracts.includes(contract.name)) {
        console.log(`Excluding ${contract.name}`);
        continue;
      }

      contracts.push(contract);
      outputs.push(
        ...[...viewOutputs, ...effectOutputs, fixtureOutput, behaviorOutput, contractOutput],
      );
    }

    // shared file
    const sharedTypesOutput = genSharedTypesFile(contracts, helperConfig);

    // index file
    const indexOutput = genIndexFile(contracts, helperConfig);

    // push in outputs
    outputs.push(...[sharedTypesOutput, indexOutput]);

    /*//////////////////////////////////////////////////////////////
                            WRITING SECTION
    //////////////////////////////////////////////////////////////*/

    const filesGenerated = processOutput(services, helperConfig, outputs);
    console.log(`Successfully generated ${filesGenerated} files in test suite!`);
  },
);
