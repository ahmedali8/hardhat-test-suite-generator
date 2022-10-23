import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

import type { B } from "../../../typechain/B";
import type { B__factory } from "../../../typechain/factories/B__factory";

export async function bFixture(): Promise<{ b: B }> {
  const signers = await ethers.getSigners();
  const deployer: SignerWithAddress = signers[0];

  const BFactory: B__factory = (await ethers.getContractFactory("B")) as B__factory;

  /* Autogenerated arguments for deploy */
  /* Please change accordingly */
  type DeployArgs = Parameters<typeof BFactory.deploy>;
  const args: DeployArgs = {} as DeployArgs;

  const b: B = (await BFactory.connect(deployer).deploy(...args)) as B;

  return { b };
}
