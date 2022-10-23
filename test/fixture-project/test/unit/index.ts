import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

import type { Signers } from "../shared/types";
import { testA } from "./a/A";
import { testB } from "./b/B";
import { testC } from "./c/C";
import { testD } from "./d/D";

describe("Unit tests", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.deployer = signers[0];
    this.signers.accounts = signers.slice(1);

    this.loadFixture = loadFixture;
  });

  testA();
  testB();
  testC();
  testD();
});
