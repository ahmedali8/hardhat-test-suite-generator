import { join } from "path";
import type { Contract, FileDescription } from "typechain";

import { FACTORY_POSTFIX } from "../constants";
import type { HelperConfig } from "./helpers";
import { getEffectFunctionNames, getViewFunctionNames } from "./helpers";
import { camelCase, hyphenate, pascalCase } from "./string";

export function genViewFunctionFile(
  contract: Contract,
  fnName: string,
  config: HelperConfig,
): FileDescription {
  return {
    path: join(config.outDirAbs, "unit", hyphenate(contract.name), "view", `${fnName}.ts`),
    contents: `
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      export default function shouldBehaveLike${pascalCase(fnName)}(): void {}
    `,
  };
}

export function genEffectFunctionFile(
  contract: Contract,
  fnName: string,
  config: HelperConfig,
): FileDescription {
  return {
    path: join(config.outDirAbs, "unit", hyphenate(contract.name), "effects", `${fnName}.ts`),
    contents: `
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      export default function shouldBehaveLike${pascalCase(fnName)}(): void {}
    `,
  };
}

export function genFixtureFile(contract: Contract, config: HelperConfig): FileDescription {
  return {
    path: join(
      config.outDirAbs,
      "unit",
      hyphenate(contract.name),
      `${pascalCase(contract.name)}.fixture.ts`,
    ),
    contents: `
      import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
      import { ethers } from "hardhat";
      import type { ${pascalCase(contract.name)} } from "${join(
      "..",
      "..",
      "..",
      config.typechainOutDir,
      config.contractsSources,
      ...contract.path,
      pascalCase(contract.name),
    )}";
      import type { ${pascalCase(contract.name)}${FACTORY_POSTFIX} } from "${join(
      "..",
      "..",
      "..",
      config.typechainOutDir,
      "factories",
      config.contractsSources,
      ...contract.path,
      `${pascalCase(contract.name)}${FACTORY_POSTFIX}`,
    )}";

      export async function ${camelCase(contract.name)}Fixture(): Promise<{ ${camelCase(
      contract.name,
    )}: ${pascalCase(contract.name)} }> {
        const signers = await ethers.getSigners();
        const deployer: SignerWithAddress = signers[0];

        const ${pascalCase(contract.name)}Factory: ${pascalCase(
      contract.name,
    )}${FACTORY_POSTFIX} = await ethers.getContractFactory("${contract.name}") as ${pascalCase(
      contract.name,
    )}${FACTORY_POSTFIX};

        /* Autogenerated arguments for deploy */
        /* Please change accordingly */
        type DeployArgs = Parameters<typeof ${pascalCase(contract.name)}Factory.deploy>;
        const args: DeployArgs = {} as DeployArgs;

        const ${camelCase(contract.name)}: ${pascalCase(contract.name)} = await ${pascalCase(
      contract.name,
    )}Factory.connect(deployer).deploy(...args) as ${pascalCase(contract.name)};
        await ${camelCase(contract.name)}.waitForDeployment();

        return { ${camelCase(contract.name)} };
      }
    `,
  };
}

export function genBehaviorFile(contract: Contract, config: HelperConfig): FileDescription {
  const viewFunctionNames = getViewFunctionNames(contract);
  const effectFunctionNames = getEffectFunctionNames(contract);

  return {
    path: join(
      config.outDirAbs,
      "unit",
      hyphenate(contract.name),
      `${pascalCase(contract.name)}.behavior.ts`,
    ),
    contents: `
      ${viewFunctionNames
        .map((n) => `import shouldBehaveLike${pascalCase(n)} from "./view/${camelCase(n)}";`)
        .join("\n")}
      ${effectFunctionNames
        .map((n) => `import shouldBehaveLike${pascalCase(n)} from "./effects/${camelCase(n)}";`)
        .join("\n")}

      export function shouldBehaveLike${pascalCase(contract.name)}Contract(): void {
        ${
          viewFunctionNames.length !== 0
            ? `
              describe("View Functions", function () {
                ${viewFunctionNames
                  .map((n) => {
                    return `describe("#${camelCase(n)}", function () {
                    shouldBehaveLike${pascalCase(n)}();
                  });`;
                  })
                  .join("\n")}
              });
            `
            : ""
        }

        ${
          effectFunctionNames.length !== 0
            ? `
              describe("Effects Functions", function () {
                ${effectFunctionNames
                  .map((n) => {
                    return `describe("#${camelCase(n)}", function () {
                      shouldBehaveLike${pascalCase(n)}();
                    });`;
                  })
                  .join("\n")}
              });
            `
            : ""
        }
      }
    `,
  };
}

export function genContractFile(contract: Contract, config: HelperConfig): FileDescription {
  return {
    path: join(
      config.outDirAbs,
      "unit",
      hyphenate(contract.name),
      `${pascalCase(contract.name)}.ts`,
    ),
    contents: `
      import { shouldBehaveLike${pascalCase(contract.name)}Contract } from "./${pascalCase(
      contract.name,
    )}.behavior";
      import { ${camelCase(contract.name)}Fixture } from "./${pascalCase(contract.name)}.fixture";

      export function test${pascalCase(contract.name)}(): void {
        describe("${pascalCase(contract.name)}", function () {
          beforeEach(async function () {
            const { ${camelCase(contract.name)} } = await this.loadFixture(${camelCase(
      contract.name,
    )}Fixture);
            this.contracts.${camelCase(contract.name)} = ${camelCase(contract.name)};
          });

          shouldBehaveLike${pascalCase(contract.name)}Contract();
        });
      }
    `,
  };
}

export function genSharedTypesFile(contracts: Contract[], config: HelperConfig): FileDescription {
  return {
    path: join(config.outDirAbs, "shared", "types.ts"),
    contents: `
      import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
      ${contracts
        .map((c) => c.name)
        .map(
          (n, i) =>
            `import type { ${pascalCase(n)} } from "${join(
              "..",
              "..",
              config.typechainOutDir,
              config.contractsSources,
              ...contracts[i].path,
              pascalCase(n),
            )}";`,
        )
        .join("\n")}

      type Fixture<T> = () => Promise<T>;

      declare module "mocha" {
        export interface Context {
          contracts: Contracts;
          loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
          signers: Signers;
        }
      }

      export interface Contracts {
        ${contracts
          .map((c) => c.name)
          .map((n) => `${camelCase(n)}: ${pascalCase(n)};`)
          .join("\n")}
      }

      export interface Signers {
        deployer: SignerWithAddress;
        accounts: SignerWithAddress[];
      }
    `,
  };
}

export function genIndexFile(contracts: Contract[], config: HelperConfig): FileDescription {
  return {
    path: join(config.outDirAbs, "unit", "index.ts"),
    contents: `
      import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
      import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
      import { ethers } from "hardhat";

      import type { Contracts, Signers } from "${join("..", "shared", "types")}";
      ${contracts
        .map((c) => c.name)
        .map((n) => `import { test${pascalCase(n)} } from "./${hyphenate(n)}/${pascalCase(n)}";`)
        .join("\n")}

      describe("Unit tests", function () {
        before(async function () {
          this.signers = {} as Signers;
          this.contracts = {} as Contracts;

          const signers: SignerWithAddress[] = await ethers.getSigners();
          this.signers.deployer = signers[0];
          this.signers.accounts = signers.slice(1);

          this.loadFixture = loadFixture;
        });

        ${contracts
          .map((c) => c.name)
          .map((n) => `test${pascalCase(n)}();`)
          .join("\n")}
      });
    `,
  };
}
