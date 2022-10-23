import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

import type { A } from "../../../typechain/A";
import type { A__factory } from "../../../typechain/factories/A__factory";

export async function aFixture(): Promise<{ a: A }> {
  const signers = await ethers.getSigners();
  const deployer: SignerWithAddress = signers[0];

  const AFactory: A__factory = (await ethers.getContractFactory("A")) as A__factory;

  /* Autogenerated arguments for deploy */
  /* Please change accordingly */
  type DeployArgs = Parameters<typeof AFactory.deploy>;
  const args: DeployArgs = {} as DeployArgs;

  const a: A = (await AFactory.connect(deployer).deploy(...args)) as A;

  return { a };
}
