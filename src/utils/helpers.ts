import { values } from "lodash";
import type { Contract, FunctionDeclaration } from "typechain";

export interface HelperConfig {
  cwd: string;
  outDirAbs: string;
  allFiles: string[];
  typechainOutDir: string;
  contractsSources: string;
  prettier?: object | undefined;
}

export function getViewFunctions(contract: Contract): FunctionDeclaration[] {
  const viewFunctions: FunctionDeclaration[] = [];

  values(contract.functions)
    .map((fns) => fns[0])
    .forEach((fn) => {
      if (fn.stateMutability === "pure" || fn.stateMutability === "view") {
        viewFunctions.push(fn);
      }
    });

  return viewFunctions;
}

export function getViewFunctionNames(contract: Contract): string[] {
  return getViewFunctions(contract).map((vf) => vf.name);
}

export function getEffectFunctions(contract: Contract): FunctionDeclaration[] {
  const effectFunctions: FunctionDeclaration[] = [];

  values(contract.functions)
    .map((fns) => fns[0])
    .forEach((fn) => {
      if (fn.stateMutability !== "pure" && fn.stateMutability !== "view") {
        effectFunctions.push(fn);
      }
    });

  return effectFunctions;
}

export function getEffectFunctionNames(contract: Contract): string[] {
  return getEffectFunctions(contract).map((ef) => ef.name);
}
