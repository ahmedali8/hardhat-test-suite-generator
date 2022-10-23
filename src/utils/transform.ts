import { relative } from "path";
import type { Contract, FileDescription } from "typechain";
import {
  detectInputsRoot,
  extractAbi,
  extractDocumentation,
  parse,
  shortenFullJsonFilePath,
} from "typechain";

import { debug } from "./debug";
import {
  genBehaviorFile,
  genContractFile,
  genEffectFunctionFile,
  genFixtureFile,
  genViewFunctionFile,
} from "./generate";
import { HelperConfig, getEffectFunctionNames, getViewFunctionNames } from "./helpers";

export interface TransformContract {
  contract: Contract;
  viewOutputs: FileDescription[];
  effectOutputs: FileDescription[];
  fixtureOutput: FileDescription;
  behaviorOutput: FileDescription;
  contractOutput: FileDescription;
}

export function transformContract(
  fd: FileDescription,
  config: HelperConfig,
): void | TransformContract {
  const abi = extractAbi(fd.contents);

  if (abi.length === 0) {
    console.log("abi.length is zero");
    return;
  }

  const documentation = extractDocumentation(fd.contents);
  const inputDir = detectInputsRoot(config.allFiles);
  const path = relative(inputDir, shortenFullJsonFilePath(fd.path, config.allFiles));
  const contract: Contract = parse(abi, path, documentation);

  console.log(`Working for contract: ${contract.name}`);
  debug({ path: fd.path, contract: contract });

  // View files
  const viewOutputs: FileDescription[] = getViewFunctionNames(contract).map((n) =>
    genViewFunctionFile(contract, n, config),
  );

  // Effect files
  const effectOutputs: FileDescription[] = getEffectFunctionNames(contract).map((n) =>
    genEffectFunctionFile(contract, n, config),
  );

  // Contract.fixture.ts
  const fixtureOutput: FileDescription = genFixtureFile(contract, config);

  // Contract.behavior.ts
  const behaviorOutput: FileDescription = genBehaviorFile(contract, config);

  // Contract.ts
  const contractOutput: FileDescription = genContractFile(contract, config);

  return {
    contract,
    viewOutputs,
    effectOutputs,
    fixtureOutput,
    behaviorOutput,
    contractOutput,
  };
}
