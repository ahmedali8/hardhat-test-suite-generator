import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import type { A } from "../../typechain/A";
import type { B } from "../../typechain/B";
import type { C } from "../../typechain/lib/C";
import type { D } from "../../typechain/test/foo/D";

type Fixture<T> = () => Promise<T>;

declare module "mocha" {
  export interface Context {
    contracts: Contracts;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}

export interface Contracts {
  a: A;
  b: B;
  c: C;
  d: D;
}

export interface Signers {
  deployer: SignerWithAddress;
  accounts: SignerWithAddress[];
}
